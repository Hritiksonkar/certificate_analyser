import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor Backend {
  public type UserRole = { #admin; #user; #guest };

  public type UserProfile = {
    name : Text;
    studentId : ?Text;
  };

  public type CertificateInput = {
    studentName : Text;
    studentId : Text;
    degree : Text;
    year : Nat;
  };

  public type Certificate = {
    id : Nat;
    studentName : Text;
    studentId : Text;
    degree : Text;
    year : Nat;
    issuer : Principal;
    issuedAt : Int;
    hash : Text;
    certificateUrl : Text;
  };

  public type CertificateHistory = {
    certificates : [Certificate];
    pageIndex : Nat;
    pageSize : Nat;
    totalCertificates : Nat;
  };

  public type VerifyCertificatePayload = {
    studentName : Text;
    studentId : Text;
    degree : Text;
    year : Nat;
    hash : Text;
  };

  public type CertificateVerificationResult = {
    isValid : Bool;
    certificate : ?Certificate;
    verificationId : Text;
  };

  stable var stableRoleEntries : [(Principal, UserRole)] = [];
  stable var stableProfileEntries : [(Principal, UserProfile)] = [];
  stable var stableCertificates : [Certificate] = [];
  stable var stableNextId : Nat = 0;

  var roles = HashMap.HashMap<Principal, UserRole>(32, Principal.equal, Principal.hash);
  var profiles = HashMap.HashMap<Principal, UserProfile>(32, Principal.equal, Principal.hash);
  var certificates = Buffer.Buffer<Certificate>(0);
  var nextId : Nat = 0;

  system func postupgrade() {
    roles := HashMap.HashMap<Principal, UserRole>(Nat.max(32, Array.size(stableRoleEntries)), Principal.equal, Principal.hash);
    for ((p, r) in stableRoleEntries.vals()) {
      roles.put(p, r);
    };

    profiles := HashMap.HashMap<Principal, UserProfile>(Nat.max(32, Array.size(stableProfileEntries)), Principal.equal, Principal.hash);
    for ((p, prof) in stableProfileEntries.vals()) {
      profiles.put(p, prof);
    };

    certificates := Buffer.Buffer<Certificate>(Array.size(stableCertificates));
    for (c in stableCertificates.vals()) {
      certificates.add(c);
    };

    nextId := stableNextId;
  };

  system func preupgrade() {
    // Gather roles
    let roleBuf = Buffer.Buffer<(Principal, UserRole)>(roles.size());
    for (entry in roles.entries()) {
      roleBuf.add(entry);
    };
    stableRoleEntries := roleBuf.toArray();

    // Gather profiles
    let profileBuf = Buffer.Buffer<(Principal, UserProfile)>(profiles.size());
    for (entry in profiles.entries()) {
      profileBuf.add(entry);
    };
    stableProfileEntries := profileBuf.toArray();

    stableCertificates := certificates.toArray();
    stableNextId := nextId;
  };

  func requireAdmin() {
    switch (roles.get(caller)) {
      case (? #admin) {};
      case (_) { throw Error.reject("Access denied: admin only"); };
    }
  };

  // Registers the caller in the access control table.
  // For this repo's current UI, the token is optional and primarily used for first-admin setup.
  // If no admins exist yet, the first registered user becomes admin.
  public func _initializeAccessControlWithSecret(_secret : Text) : async () {
    if (roles.get(caller) != null) return;

    var hasAdmin = false;
    label scan for ((_, r) in roles.entries()) {
      if (r == #admin) { hasAdmin := true; break scan };
    };

    if (hasAdmin) {
      roles.put(caller, #user);
    } else {
      roles.put(caller, #admin);
    };
  };

  public query func getCallerUserRole() : async UserRole {
    switch (roles.get(caller)) {
      case (?r) r;
      case null { throw Error.reject("User is not registered"); };
    }
  };

  public func assignCallerUserRole(user : Principal, role : UserRole) : async () {
    requireAdmin();
    roles.put(user, role);
  };

  public query func isCallerAdmin() : async Bool {
    switch (roles.get(caller)) {
      case (? #admin) true;
      case (_) false;
    }
  };

  public query func getCallerUserProfile() : async ?UserProfile {
    profiles.get(caller)
  };

  public func saveCallerUserProfile(profile : UserProfile) : async () {
    profiles.put(caller, profile);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    profiles.get(user)
  };

  public func issueCertificate(input : CertificateInput, hash : Text, _url : Text) : async Certificate {
    requireAdmin();

    let id = nextId;
    nextId += 1;

    let cert : Certificate = {
      id = id;
      studentName = input.studentName;
      studentId = input.studentId;
      degree = input.degree;
      year = input.year;
      issuer = caller;
      issuedAt = Time.now();
      hash = hash;
      certificateUrl = "/verify?certId=" # Nat.toText(id);
    };

    certificates.add(cert);
    cert
  };

  public query func getCertificateById(id : Nat) : async ?Certificate {
    if (id >= certificates.size()) return null;
    ?certificates.get(id)
  };

  public query func getCertificatesByStudentId(studentId : Text) : async [Certificate] {
    let buf = Buffer.Buffer<Certificate>(0);
    for (c in certificates.vals()) {
      if (c.studentId == studentId) { buf.add(c) };
    };
    buf.toArray()
  };

  public query func getCertificateHistory(pageIndex : Nat, pageSize : Nat) : async CertificateHistory {
    requireAdmin();
    let total = certificates.size();

    if (pageSize == 0) {
      return {
        certificates = [];
        pageIndex = pageIndex;
        pageSize = pageSize;
        totalCertificates = total;
      };
    };

    let start = pageIndex * pageSize;
    if (start >= total) {
      return {
        certificates = [];
        pageIndex = pageIndex;
        pageSize = pageSize;
        totalCertificates = total;
      };
    };

    // Return newest-first
    let endExclusive = Nat.min(total, start + pageSize);
    let out = Buffer.Buffer<Certificate>(0);

    var i : Nat = start;
    while (i < endExclusive) {
      // Map i=0 to last element, i=1 to second-last, etc.
      let idxFromEnd = total - 1 - i;
      out.add(certificates.get(idxFromEnd));
      i += 1;
    };

    {
      certificates = out.toArray();
      pageIndex = pageIndex;
      pageSize = pageSize;
      totalCertificates = total;
    }
  };

  public query func verifyCertificate(payload : VerifyCertificatePayload, _hashes : [(Text, Text)]) : async CertificateVerificationResult {
    // Minimal implementation: treat the certificate as valid if the provided hash matches any stored certificate hash.
    var found : ?Certificate = null;
    label scan for (c in certificates.vals()) {
      if (c.hash == payload.hash) { found := ?c; break scan };
    };

    let now = Time.now();
    let verificationId = Principal.toText(caller) # ":" # Int.toText(now);

    switch (found) {
      case (?c) {
        {
          isValid = true;
          certificate = ?c;
          verificationId = verificationId;
        }
      };
      case null {
        {
          isValid = false;
          certificate = null;
          verificationId = verificationId;
        }
      };
    }
  };
}
