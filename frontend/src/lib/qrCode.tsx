import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCode({ value, size = 200, className = '' }: QRCodeProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="p-4 bg-white rounded-xl shadow-md border border-slate-100">
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          includeMargin={false}
        />
      </div>
      <p className="text-xs text-center text-muted-foreground">
        Scan to verify certificate
      </p>
    </div>
  );
}
