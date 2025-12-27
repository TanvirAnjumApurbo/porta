"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { adminVerifyUser } from "@/server/actions/verification";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, Eye, MapPin, Phone, Calendar, User, Flag, CreditCard } from "lucide-react";

interface VerificationUser {
  id: string;
  clerkId: string;
  email: string;
  legalName: string | null;
  phone: string | null;
  nationality: string | null;
  permanentAddress: string | null;
  gender: string | null;
  dob: string | Date | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  idType: string | null;
  idNumber: string | null;
  issuingCountry: string | null;
  idImageUrl: string | null;
  userPhotoUrl: string | null;
  verificationStatus: string;
  createdAt: string | Date;
}

interface VerificationRowActionsProps {
  user: VerificationUser;
}

export function VerificationRowActions({ user }: VerificationRowActionsProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await adminVerifyUser(user.clerkId, "APPROVED");
      router.refresh();
    } catch (error) {
      console.error("Failed to approve", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await adminVerifyUser(user.clerkId, "REJECTED");
      router.refresh();
    } catch (error) {
      console.error("Failed to reject", error);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {/* Review Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsReviewOpen(true)}
        >
          <Eye className="w-4 h-4 mr-1" />
          Review
        </Button>

        {/* Approve Button with Confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              disabled={isApproving || isRejecting}
            >
              {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Verification</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve the verification for <strong>{user.legalName}</strong>? 
                This will grant them access to post requests and travel.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                Approve
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reject Button with Confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              size="sm"
              variant="destructive"
              disabled={isApproving || isRejecting}
            >
              {isRejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Verification</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject the verification for <strong>{user.legalName}</strong>? 
                They will need to resubmit their verification.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReject} className="bg-destructive hover:bg-destructive/90">
                Reject
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Verification Details
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                {user.verificationStatus}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">PERSONAL INFORMATION</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground text-xs block">Legal Name</span>
                    <span className="font-medium">{user.legalName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground text-xs block">Date of Birth</span>
                    <span className="font-medium">{user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground text-xs block">Gender</span>
                    <span className="font-medium">{user.gender}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground text-xs block">Nationality</span>
                    <span className="font-medium">{user.nationality}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground text-xs block">Phone</span>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="pt-4 border-t">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-muted-foreground text-xs block">Permanent Address</span>
                  <span className="font-medium text-sm">{user.permanentAddress}</span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">EMERGENCY CONTACT</h3>
              <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                <span className="font-medium">{user.emergencyContactName}</span>
                <span className="text-muted-foreground text-sm flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {user.emergencyContactPhone}
                </span>
              </div>
            </div>

            {/* ID Document */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">ID DOCUMENT</h3>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm uppercase font-medium">{user.idType}</span>
                </div>
                <span className="font-mono text-sm">{user.idNumber}</span>
              </div>
              <div className="text-xs text-muted-foreground mb-4">
                Issuing Country: <span className="font-medium text-foreground">{user.issuingCountry}</span>
              </div>
              
              {/* Images */}
              <div className="grid grid-cols-2 gap-3">
                {user.idImageUrl && (
                  <div 
                    className="relative aspect-video bg-black/10 rounded-lg overflow-hidden border cursor-pointer group"
                    onClick={() => setSelectedImage(user.idImageUrl)}
                  >
                    <Image 
                      src={user.idImageUrl} 
                      alt="ID Document" 
                      fill 
                      className="object-cover transition-transform group-hover:scale-105" 
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-2 py-1">
                      ID Document - Click to enlarge
                    </div>
                  </div>
                )}
                {user.userPhotoUrl && (
                  <div 
                    className="relative aspect-video bg-black/10 rounded-lg overflow-hidden border cursor-pointer group"
                    onClick={() => setSelectedImage(user.userPhotoUrl)}
                  >
                    <Image 
                      src={user.userPhotoUrl} 
                      alt="User Photo" 
                      fill 
                      className="object-cover transition-transform group-hover:scale-105" 
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-2 py-1">
                      User Photo - Click to enlarge
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t flex gap-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" disabled={isApproving || isRejecting}>
                    {isApproving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                    Approve Verification
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve Verification</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to approve the verification for <strong>{user.legalName}</strong>?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { handleApprove(); setIsReviewOpen(false); }} className="bg-green-600 hover:bg-green-700">
                      Approve
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1" disabled={isApproving || isRejecting}>
                    {isRejecting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <X className="w-4 h-4 mr-1" />}
                    Reject Verification
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Verification</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject the verification for <strong>{user.legalName}</strong>?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { handleReject(); setIsReviewOpen(false); }} className="bg-destructive hover:bg-destructive/90">
                      Reject
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Image Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative w-full min-h-[400px]">
              <Image 
                src={selectedImage} 
                alt="Document" 
                fill
                className="object-contain" 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
