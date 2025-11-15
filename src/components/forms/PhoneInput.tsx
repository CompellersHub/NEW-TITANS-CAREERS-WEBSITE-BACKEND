import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
}

const countryCodes = [
  { code: '+44', country: 'UK', flag: '🇬🇧', regex: /^[1-9]\d{9,10}$/ },
  { code: '+1', country: 'US/CA', flag: '🇺🇸', regex: /^[2-9]\d{9}$/ },
  { code: '+234', country: 'NG', flag: '🇳🇬', regex: /^[789]\d{9}$/ },
  { code: '+91', country: 'IN', flag: '🇮🇳', regex: /^\d{10}$/ },
  { code: '+971', country: 'AE', flag: '🇦🇪', regex: /^5\d{8}$/ },
];

export function PhoneInput({ value, onChange, label = "WhatsApp Number", required, error }: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState('+44');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Parse existing value if present
    if (value && value.includes(' ')) {
      const [code, number] = value.split(' ');
      setCountryCode(code);
      setPhoneNumber(number);
    }
  }, []);

  useEffect(() => {
    const fullNumber = `${countryCode} ${phoneNumber}`;
    onChange(fullNumber);

    if (phoneNumber.length > 5) {
      setIsValidating(true);
      const timer = setTimeout(() => {
        validateNumber(countryCode, phoneNumber);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsValid(null);
      setIsValidating(false);
    }
  }, [countryCode, phoneNumber, onChange]);

  const validateNumber = (code: string, number: string) => {
    const country = countryCodes.find(c => c.code === code);
    if (country && number) {
      const cleanNumber = number.replace(/\s+/g, '');
      const valid = country.regex.test(cleanNumber);
      setIsValid(valid);
    } else {
      setIsValid(null);
    }
    setIsValidating(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setPhoneNumber(value);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-semibold text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        <Select value={countryCode} onValueChange={setCountryCode}>
          <SelectTrigger className="w-[140px] border-2 focus:border-accent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countryCodes.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span className="font-semibold">{country.code}</span>
                  <span className="text-muted-foreground text-xs">{country.country}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="Enter phone number"
            className={cn(
              "pr-10 border-2 focus:border-accent",
              isValid === true && "border-success",
              isValid === false && "border-destructive"
            )}
          />
          {!isValidating && isValid !== null && phoneNumber && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValid ? (
                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                  <Check className="w-4 h-4 text-white font-bold" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center">
                  <X className="w-4 h-4 text-destructive-foreground font-bold" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {isValid === false && phoneNumber && (
        <p className="text-xs text-destructive font-medium">
          Invalid phone number for selected country
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        We'll send course updates and important notifications via WhatsApp
      </p>
    </div>
  );
}
