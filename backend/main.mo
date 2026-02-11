import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    studentId : ?Text;
  };

  public type Certificate = {
    id : Nat;
    studentName : Text;
    studentId : Text;
    degree : Text;
    year : Nat;
    issuer : Principal;
    issuedAt : Time.Time;
    hash : Text;
    certificateUrl : Text;
  };

  module Certificate {
    public func compare(certificate1 : Certificate, certificate2 : Certificate) : Order.Order {
      Nat.compare(certificate1.id, certificate2.id);
    };
  };

  public type CertificateInput = {
    studentName : Text;
    studentId : Text;
    degree : Text;
    year : Nat;
  };

  public type CertificateVerificationResult = {
    isValid : Bool;
    certificate : ?Certificate;
    verificationId : Text;
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

  let userProfiles = Map.empty<Principal, UserProfile>();
  let certificates = Map.empty<Nat, Certificate>();
  let certificatesByStudentId = Map.empty<Text, Set.Set<Nat>>();
  let verifiedCertificates = Map.empty<(Text, Text), Nat>();

  var nextCertificateId = 0;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Certificate Management
  func generateVerificationId(studentId : Text, _ : [(Text, Text)]) : Text {
    // Only include the studentId in the verificationId
    studentId # "_id_";
  };

  public shared ({ caller }) func issueCertificate(input : CertificateInput, hash : Text, url : Text) : async Certificate {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can issue certificates");
    };

    let certificate = {
      id = nextCertificateId;
      studentName = input.studentName;
      studentId = input.studentId;
      degree = input.degree;
      year = input.year;
      issuer = caller;
      issuedAt = Time.now();
      hash;
      certificateUrl = url;
    };

    certificates.add(nextCertificateId, certificate);

    switch (certificatesByStudentId.get(input.studentId)) {
      case (null) {
        let newSet = Set.singleton<Nat>(nextCertificateId);
        certificatesByStudentId.add(input.studentId, newSet);
      };
      case (?existingSet) {
        existingSet.add(nextCertificateId);
      };
    };

    nextCertificateId += 1;
    certificate;
  };

  public query ({ caller }) func getCertificateById(id : Nat) : async ?Certificate {
    // Public access for verification purposes
    certificates.get(id);
  };

  public query ({ caller }) func getCertificatesByStudentId(studentId : Text) : async [Certificate] {
    // Students can only view their own certificates, admins can view all
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view certificates");
    };

    // Check if caller is admin or if the studentId matches their profile
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    if (not isAdmin) {
      switch (userProfiles.get(caller)) {
        case (null) {
          Runtime.trap("Unauthorized: No profile found for user");
        };
        case (?profile) {
          switch (profile.studentId) {
            case (null) {
              Runtime.trap("Unauthorized: No student ID linked to your profile");
            };
            case (?userStudentId) {
              if (userStudentId != studentId) {
                Runtime.trap("Unauthorized: Can only view your own certificates");
              };
            };
          };
        };
      };
    };

    switch (certificatesByStudentId.get(studentId)) {
      case (null) { return [] };
      case (?ids) {
        return ids.toArray().map(
          func(id) {
            switch (certificates.get(id)) {
              case (null) { Runtime.trap("Certificate not found") };
              case (?cert) { return cert };
            };
          }
        );
      };
    };
  };

  func compareVerifyCertificatePayload(a : (Text, Text), b : (Text, Text)) : Order.Order {
    Text.compare(a.0, b.0);
  };

  public query ({ caller }) func verifyCertificate(
    payload : VerifyCertificatePayload,
    certificateHashes : [(Text, Text)]
  ) : async CertificateVerificationResult {
    // Public access for verification - no authentication required
    let verificationId = generateVerificationId(payload.studentId, certificateHashes);

    switch (certificateHashes.find(func(x) { x.1 == payload.hash })) {
      case (null) {
        {
          isValid = false;
          certificate = null;
          verificationId;
        };
      };
      case (?cert) {
        {
          isValid = true;
          certificate = certificates.values().toArray().find(
            func(certificate) {
              certificate.hash == cert.1;
            }
          );
          verificationId;
        };
      };
    };
  };

  public query ({ caller }) func getCertificateHistory(pageIndex : Nat, pageSize : Nat) : async CertificateHistory {
    // Admin-only access for transaction/history view
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view certificate history");
    };

    let certificatesArray = certificates.values().toArray().sort();
    let totalCertificates = certificatesArray.size();

    let startIndex = pageIndex * pageSize;
    if (startIndex >= totalCertificates) { return { certificates = []; pageIndex; pageSize; totalCertificates } };

    let endIndex = Nat.min(startIndex + pageSize, totalCertificates);
    let paginatedCertificates = certificatesArray.sliceToArray(startIndex, endIndex);

    {
      certificates = paginatedCertificates;
      pageIndex;
      pageSize;
      totalCertificates;
    };
  };
};
