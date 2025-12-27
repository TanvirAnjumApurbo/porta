"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IKUpload, ImageKitProvider } from "imagekitio-next";
import { Loader2, UploadCloud, FileIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitVerification } from "@/server/actions/verification";
import { AddressSelection } from "./address-selection";
import { CountrySelect } from "./country-select";
import { PhoneInput } from "@/components/ui/phone-input";

const verificationSchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  phone: z.string().min(1, "Phone number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  permanentAddress: z.string().min(1, "Permanent address is required"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(1, "Emergency contact phone is required"),
  idType: z.enum(["PASSPORT", "NID", "DRIVING_LICENSE"]),
  idNumber: z.string().min(1, "ID number is required"),
  issuingCountry: z.string().min(1, "Issuing country is required"),
  idImageUrl: z.string().url("ID image is required"),
  userPhotoUrl: z.string().url("User photo is required"),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VerificationModal({ isOpen, onClose }: VerificationModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idUploadLoading, setIdUploadLoading] = useState(false);
  const [photoUploadLoading, setPhotoUploadLoading] = useState(false);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      idType: "PASSPORT",
    },
  });

  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form;
  const idImageUrl = watch("idImageUrl");
  const userPhotoUrl = watch("userPhotoUrl");

  const onSubmit = async (data: VerificationFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await submitVerification(data);
      if (result.success) {
        onClose();
        router.refresh(); // Refresh to show pending status
      } else {
        console.error("Verification failed", result);
        alert("Submission failed. Please check your data.");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (err: any) => {
    console.log("ImageKit Error", err);
    alert("Image Upload Failed");
  };

  const onUserIdSuccess = (res: any) => {
    setValue("idImageUrl", res.url);
    setIdUploadLoading(false);
  };
  
  const onUserPhotoSuccess = (res: any) => {
    setValue("userPhotoUrl", res.url);
    setPhotoUploadLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Identity Verification</DialogTitle>
          <DialogDescription>
            Please provide your details to verify your identity. This is required to post request or travel.
          </DialogDescription>
        </DialogHeader>

        <ImageKitProvider
          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
          publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
          authenticator={async () => {
            const response = await fetch("/api/imagekit/auth");
            return await response.json();
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Legal Name</label>
                <Input {...register("legalName")} placeholder="As on your ID" />
                {errors.legalName && <p className="text-destructive text-xs">{errors.legalName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <Input type="date" {...register("dob")} />
                {errors.dob && <p className="text-destructive text-xs">{errors.dob.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <select {...register("gender")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                   <option value="">Select Gender</option>
                   <option value="Male">Male</option>
                   <option value="Female">Female</option>
                   <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-destructive text-xs">{errors.gender.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nationality</label>
                <Input {...register("nationality")} placeholder="e.g. American" />
                {errors.nationality && <p className="text-destructive text-xs">{errors.nationality.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput 
                      value={field.value} 
                      onChange={field.onChange} 
                      error={errors.phone?.message}
                      placeholder="+1 234 567 890"
                    />
                  )}
                />
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <h3 className="text-lg font-semibold">Permanent Address</h3>
              <AddressSelection 
                onAddressChange={(address) => {
                  const formattedAddress = [address.addressLine, address.city, address.state, address.country, address.zipCode]
                    .filter(Boolean)
                    .join(", ");
                  setValue("permanentAddress", formattedAddress);
                }}
              />
              {errors.permanentAddress && <p className="text-destructive text-xs">{errors.permanentAddress.message}</p>}
            </div>

            <div className="space-y-2 border-t pt-4">
              <h3 className="text-lg font-semibold">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input {...register("emergencyContactName")} placeholder="Contact Person" />
                  {errors.emergencyContactName && <p className="text-destructive text-xs">{errors.emergencyContactName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Controller
                    name="emergencyContactPhone"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput 
                        value={field.value} 
                        onChange={field.onChange} 
                        error={errors.emergencyContactPhone?.message}
                        placeholder="Emergency Phone"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <h3 className="text-lg font-semibold">Identity Document</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ID Type</label>
                  <select {...register("idType")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="PASSPORT">Passport</option>
                    <option value="NID">National ID</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ID Number</label>
                  <Input {...register("idNumber")} placeholder="ID Number" />
                  {errors.idNumber && <p className="text-destructive text-xs">{errors.idNumber.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Issuing Country</label>
                  <CountrySelect 
                    value={watch("issuingCountry") || ""}
                    onValueChange={(value) => setValue("issuingCountry", value)}
                    placeholder="Select Issuing Country"
                  />
                  {errors.issuingCountry && <p className="text-destructive text-xs">{errors.issuingCountry.message}</p>}
                </div>
              </div>

              <div className="space-y-4 mt-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Upload ID Document</label>
                    <div className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition relative min-h-[120px]">
                        {idUploadLoading ? (
                             <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : idImageUrl ? (
                          <div className="relative w-full">
                            <img 
                              src={idImageUrl} 
                              alt="ID Document Preview" 
                              className="w-full max-h-48 object-contain rounded-md"
                            />
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="icon" 
                              className="absolute top-2 right-2 h-6 w-6" 
                              onClick={() => setValue("idImageUrl", "")}
                            >
                               <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">Click to upload ID Document</span>
                             <IKUpload
                                fileName="id-document"
                                folder="/verification/ids"
                                useUniqueFileName={true}
                                validateFile={(file) => file.size < 5 * 1024 * 1024} // 5MB limit
                                onUploadStart={() => setIdUploadLoading(true)}
                                onSuccess={onUserIdSuccess}
                                onError={(err) => { setIdUploadLoading(false); onError(err)}}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </>
                        )}
                    </div>
                     {errors.idImageUrl && <p className="text-destructive text-xs">{errors.idImageUrl.message}</p>}
                 </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload Your Photo</label>
                     <div className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition relative min-h-[120px]">
                        {photoUploadLoading ? (
                             <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : userPhotoUrl ? (
                           <div className="relative w-full">
                            <img 
                              src={userPhotoUrl} 
                              alt="User Photo Preview" 
                              className="w-full max-h-48 object-contain rounded-md"
                            />
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="icon" 
                              className="absolute top-2 right-2 h-6 w-6" 
                              onClick={() => setValue("userPhotoUrl", "")}
                            >
                               <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">Click to upload Your Photo</span>
                             <IKUpload
                                fileName="user-photo"
                                folder="/verification/photos"
                                useUniqueFileName={true}
                                validateFile={(file) => file.size < 5 * 1024 * 1024} // 5MB limit
                                onUploadStart={() => setPhotoUploadLoading(true)}
                                onSuccess={onUserPhotoSuccess}
                                onError={(err) => { setPhotoUploadLoading(false); onError(err)}}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </>
                        )}
                    </div>
                    {errors.userPhotoUrl && <p className="text-destructive text-xs">{errors.userPhotoUrl.message}</p>}
                 </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting || idUploadLoading || photoUploadLoading}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                Submit Verification
              </Button>
            </div>
          </form>
        </ImageKitProvider>
      </DialogContent>
    </Dialog>
  );
}
