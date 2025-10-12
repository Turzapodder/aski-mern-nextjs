"use client"

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  useUpdateProfileMutation, 
  useUploadFilesMutation 
} from "@/lib/services/profile";
import { 
  Form, FormField, FormItem, FormLabel, FormMessage, FormControl 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProfileProgress from "@/components/ProfileProgress";

type Role = "student" | "tutor" | "admin" | "user" | undefined;

const commonSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dateOfBirth: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  about: z.string().max(800).optional(),
  languages: z.array(z.string()).optional(),
  socialLinks: z
    .object({
      facebook: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      twitter: z.string().url().optional(),
      instagram: z.string().url().optional(),
      website: z.string().url().optional(),
    })
    .optional(),
  profileImage: z.string().optional(),
});

const studentSchema = z.object({
  institutionName: z.string().min(2, "Institution name is required"),
  institutionType: z.enum(["College", "University", "High School", "Other"]).optional(),
  department: z.string().optional(),
  degree: z.string().min(1, "Degree is required"),
  yearOfStudy: z.string().min(1, "Year/semester is required"),
  studentID: z.string().optional(),
  cgpa: z.string().optional(),
  interests: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  guardianContact: z.string().optional(),
});

const tutorSchema = z.object({
  professionalTitle: z.string().optional(),
  qualification: z.string().min(1, "Qualification is required"),
  expertiseSubjects: z.array(z.string()).min(1, "Add at least one subject"),
  experienceYears: z.number().int().min(0).optional(),
  currentInstitution: z.string().optional(),
  availableDays: z.array(z.string()).optional(),
  availableTimeSlots: z.array(z.string()).optional(),
  hourlyRate: z.number().min(0, "Hourly rate must be positive"),
  teachingMode: z.enum(["Online", "Offline", "Hybrid"]).optional(),
  achievements: z.string().optional(),
});

const profileSchema = z.object({
  profileStatus: z.boolean().optional(),
  common: commonSchema,
  studentProfile: studentSchema.optional(),
  tutorProfile: tutorSchema.optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface Props {
  userId: string;
  role: Role;
  initialProfile?: any;
}

export default function ProfileEditor({ userId, role, initialProfile }: Props) {
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadFiles, { isLoading: isUploading }] = useUploadFilesMutation();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      profileStatus: initialProfile?.profileStatus ?? false,
      common: {
        fullName: initialProfile?.fullName ?? "",
        email: initialProfile?.email ?? initialProfile?.username ?? "",
        phone: initialProfile?.phone ?? "",
        gender: initialProfile?.gender ?? undefined,
        dateOfBirth: initialProfile?.dateOfBirth ?? "",
        country: initialProfile?.country ?? "",
        city: initialProfile?.city ?? "",
        address: initialProfile?.address ?? "",
        about: initialProfile?.about ?? "",
        languages: initialProfile?.languages ?? [],
        socialLinks: initialProfile?.socialLinks ?? {},
        profileImage: initialProfile?.profileImage ?? "",
      },
      studentProfile: initialProfile?.studentProfile,
      tutorProfile: initialProfile?.tutorProfile,
    },
  });

  useEffect(() => {
    if (initialProfile) {
      form.reset({
        profileStatus: initialProfile?.profileStatus ?? false,
        common: {
          fullName: initialProfile?.fullName ?? "",
          email: initialProfile?.email ?? initialProfile?.username ?? "",
          phone: initialProfile?.phone ?? "",
          gender: initialProfile?.gender ?? undefined,
          dateOfBirth: initialProfile?.dateOfBirth ?? "",
          country: initialProfile?.country ?? "",
          city: initialProfile?.city ?? "",
          address: initialProfile?.address ?? "",
          about: initialProfile?.about ?? "",
          languages: initialProfile?.languages ?? [],
          socialLinks: initialProfile?.socialLinks ?? {},
          profileImage: initialProfile?.profileImage ?? "",
        },
        studentProfile: initialProfile?.studentProfile,
        tutorProfile: initialProfile?.tutorProfile,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProfile]);

  const onSubmit = async (values: ProfileFormValues) => {
    const payload: any = {
      profileStatus: values.profileStatus,
      ...values.common,
    };

    if (role === "student" && values.studentProfile) {
      payload.studentProfile = values.studentProfile;
    }
    if (role === "tutor" && values.tutorProfile) {
      payload.tutorProfile = values.tutorProfile;
    }
    try {
      await updateProfile({ userId, data: payload }).unwrap();
      alert("Profile updated successfully");
    } catch (e: any) {
      alert(e?.data?.message || "Failed to update profile");
    }
  };

  const handleImageUpload = async (file?: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("profileImage", file);
    try {
      const res = await uploadFiles(formData).unwrap();
      const url = res?.files?.profileImage?.url || res?.url || res?.path;
      if (url) {
        form.setValue("common.profileImage", url);
      }
    } catch (e: any) {
      alert(e?.data?.message || "Image upload failed");
    }
  };

  const handleDocsUpload = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("documents", f));
    try {
      const res = await uploadFiles(formData).unwrap();
      const docs = res?.files?.documents || [];
      if (role === "student") {
        const prev = form.getValues("studentProfile") || {};
        form.setValue("studentProfile", { ...prev, documents: docs } as any);
      } else if (role === "tutor") {
        const prev = form.getValues("tutorProfile") || {};
        form.setValue("tutorProfile", { ...prev, documents: docs } as any);
      }
    } catch (e: any) {
      alert(e?.data?.message || "Documents upload failed");
    }
  };

  const isTutor = role === "tutor";
  const isStudent = role === "student";

  const completion = useMemo(() => {
    const p = form.getValues();
    let total = 0;
    let filled = 0;
    const addField = (val: any) => {
      total += 1;
      if (
        (Array.isArray(val) && val.length > 0) ||
        (typeof val === 'number' && !isNaN(val)) ||
        (typeof val === 'boolean') ||
        (typeof val === 'string' && val.trim().length > 0)
      ) {
        filled += 1;
      }
    };
    const c = p.common || {};
    [c.fullName, c.phone, c.country, c.city, c.address, c.about, c.profileImage].forEach(addField);
    if (isStudent && p.studentProfile) {
      const s: any = p.studentProfile;
      [s.institutionName, s.degree, s.yearOfStudy].forEach(addField);
    }
    if (isTutor && p.tutorProfile) {
      const t: any = p.tutorProfile;
      [t.qualification, t.hourlyRate, (t.expertiseSubjects || []).length].forEach(addField);
    }
    if (total === 0) return 0;
    return Math.round((filled / total) * 100);
  }, [form, isStudent, isTutor]);

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="mb-2">Edit Profile</CardTitle>
        <ProfileProgress value={completion} />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Image */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {form.watch("common.profileImage") ? (
                  <AvatarImage src={form.watch("common.profileImage")!} />
                ) : (
                  <AvatarFallback>PF</AvatarFallback>
                )}
              </Avatar>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
              />
            </div>

            {/* Common Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="common.fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="common.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 555-555-5555" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="common.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="common.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="common.about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Tell us about yourself" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Student Section */}
            {isStudent && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Academic Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="studentProfile.institutionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution Name</FormLabel>
                        <FormControl>
                          <Input placeholder="University of X" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="studentProfile.degree"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree</FormLabel>
                        <FormControl>
                          <Input placeholder="BSc, MSc, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="studentProfile.yearOfStudy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year/Semester</FormLabel>
                        <FormControl>
                          <Input placeholder="3rd Year" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormLabel>Student Documents</FormLabel>
                  <input type="file" multiple onChange={(e) => handleDocsUpload(e.target.files)} />
                </div>
              </div>
            )}

            {/* Tutor Section */}
            {isTutor && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tutorProfile.qualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualification</FormLabel>
                        <FormControl>
                          <Input placeholder="MSc in Physics" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tutorProfile.hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="tutorProfile.expertiseSubjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expertise Subjects (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="Math, Physics" value={(field.value || []).join(", ")} onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Certificates / Resume</FormLabel>
                  <input type="file" multiple onChange={(e) => handleDocsUpload(e.target.files)} />
                </div>
              </div>
            )}

            <CardFooter className="flex gap-2">
              <Button type="submit" disabled={isUpdating || isUploading}>
                {isUpdating ? "Updating..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}