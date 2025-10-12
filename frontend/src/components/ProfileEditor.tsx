"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useUpdateProfileMutation,
  useUploadFilesMutation,
} from "@/lib/services/profile";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ProfileProgress from "@/components/ProfileProgress";

type Role = "student" | "tutor" | "admin" | "user" | undefined;

const commonSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dateOfBirth: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  about: z.string().max(800).optional(),
  languages: z.array(z.string()).optional(),
  profileImage: z.string().optional(),
});

const studentSchema = z.object({
  institutionName: z.string().min(2, "Institution name is required"),
  institutionType: z
    .enum(["College", "University", "High School", "Other"])
    .optional(),
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
        name: initialProfile?.name ?? "",
        email: initialProfile?.email ?? initialProfile?.username ?? "",
        phone: initialProfile?.phone ?? "",
        gender: initialProfile?.gender ?? undefined,
        dateOfBirth: initialProfile?.dateOfBirth ?? "",
        country: initialProfile?.country ?? "",
        city: initialProfile?.city ?? "",
        address: initialProfile?.address ?? "",
        about: initialProfile?.about ?? "",
        languages: initialProfile?.languages ?? [],
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
          name: initialProfile?.name ?? "",
          email: initialProfile?.email ?? initialProfile?.username ?? "",
          phone: initialProfile?.phone ?? "",
          gender: initialProfile?.gender ?? undefined,
          dateOfBirth: initialProfile?.dateOfBirth ?? "",
          country: initialProfile?.country ?? "",
          city: initialProfile?.city ?? "",
          address: initialProfile?.address ?? "",
          about: initialProfile?.about ?? "",
          languages: initialProfile?.languages ?? [],
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
        (typeof val === "number" && !isNaN(val)) ||
        typeof val === "boolean" ||
        (typeof val === "string" && val.trim().length > 0)
      ) {
        filled += 1;
      }
    };
    const c = p.common || {};
    [
      c.name,
      c.phone,
      c.country,
      c.city,
      c.address,
      c.about,
      c.profileImage,
    ].forEach(addField);
    if (isStudent && p.studentProfile) {
      const s: any = p.studentProfile;
      [s.institutionName, s.degree, s.yearOfStudy].forEach(addField);
    }
    if (isTutor && p.tutorProfile) {
      const t: any = p.tutorProfile;
      [
        t.qualification,
        t.hourlyRate,
        (t.expertiseSubjects || []).length,
      ].forEach(addField);
    }
    if (total === 0) return 0;
    return Math.round((filled / total) * 100);
  }, [form, isStudent, isTutor]);

  return (
    <Card className='w-full mx-auto'>
      <CardHeader>
        <CardTitle className='mb-2'>Edit Profile</CardTitle>
        <ProfileProgress value={completion} />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            {/* Profile Image */}
            <div className='flex items-center gap-4'>
              <Avatar className='h-16 w-16'>
                {form.watch("common.profileImage") ? (
                  <AvatarImage src={form.watch("common.profileImage")!} />
                ) : (
                  <AvatarFallback>PF</AvatarFallback>
                )}
              </Avatar>
              <input
                type='file'
                accept='image/*'
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
              />
            </div>

            {/* Common Info */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='common.name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder='John Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='common.email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='email@example.com'
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='common.phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder='+1 555-555-5555' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='common.gender'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <select
                        className='border rounded h-10 px-3'
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value as any)}
                      >
                        <option value=''>Select gender</option>
                        <option value='Male'>Male</option>
                        <option value='Female'>Female</option>
                        <option value='Other'>Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='common.dateOfBirth'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='common.country'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder='Country' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='common.city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder='City' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='common.address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder='Full Address' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='common.about'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder='Tell us about yourself'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Languages */}
            <FormField
              control={form.control}
              name='common.languages'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Languages (comma separated)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='English, Bengali'
                      value={(field.value || []).join(", ")}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Profile Status */}
            <FormField
              control={form.control}
              name='profileStatus'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Complete</FormLabel>
                  <FormControl>
                    <input
                      type='checkbox'
                      checked={Boolean(field.value)}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Student Section */}
            {isStudent && (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Academic Info</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='studentProfile.institutionName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution Name</FormLabel>
                        <FormControl>
                          <Input placeholder='University of X' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='studentProfile.institutionType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution Type</FormLabel>
                        <FormControl>
                          <select
                            className='border rounded h-10 px-3'
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value as any)
                            }
                          >
                            <option value=''>Select type</option>
                            <option value='College'>College</option>
                            <option value='University'>University</option>
                            <option value='High School'>High School</option>
                            <option value='Other'>Other</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='studentProfile.degree'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Degree</FormLabel>
                        <FormControl>
                          <Input placeholder='BSc, MSc, etc.' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='studentProfile.yearOfStudy'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year/Semester</FormLabel>
                        <FormControl>
                          <Input placeholder='3rd Year' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='studentProfile.department'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department/Major</FormLabel>
                        <FormControl>
                          <Input placeholder='Department' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='studentProfile.studentID'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student ID</FormLabel>
                        <FormControl>
                          <Input placeholder='ID Number' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='studentProfile.cgpa'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CGPA</FormLabel>
                        <FormControl>
                          <Input placeholder='3.75' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name='studentProfile.interests'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interests (comma separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Robotics, AI'
                          value={(field.value || []).join(", ")}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='studentProfile.skills'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (comma separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Math, Programming'
                          value={(field.value || []).join(", ")}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='studentProfile.guardianContact'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian Contact</FormLabel>
                      <FormControl>
                        <Input placeholder='+1 555-...' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Student Documents</FormLabel>
                  <input
                    type='file'
                    multiple
                    onChange={(e) => handleDocsUpload(e.target.files)}
                  />
                  {Array.isArray(
                    (form.watch("studentProfile") as any)?.documents
                  ) && (
                    <ul className='mt-2 list-disc pl-5 text-sm'>
                      {(form.watch("studentProfile") as any)?.documents?.map(
                        (d: any, idx: number) => (
                          <li key={idx}>
                            <a
                              className='text-blue-600 underline'
                              href={d.url}
                              target='_blank'
                              rel='noreferrer'
                            >
                              {d.filename || d.url}
                            </a>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Tutor Section */}
            {isTutor && (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Professional Info</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='tutorProfile.professionalTitle'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Title</FormLabel>
                        <FormControl>
                          <Input placeholder='Assistant Professor' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='tutorProfile.qualification'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualification</FormLabel>
                        <FormControl>
                          <Input placeholder='MSc in Physics' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='tutorProfile.experienceYears'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Years</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='5'
                            value={field.value as any}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='tutorProfile.currentInstitution'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Institution</FormLabel>
                        <FormControl>
                          <Input placeholder='University of X' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='tutorProfile.hourlyRate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='50'
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name='tutorProfile.expertiseSubjects'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Expertise Subjects (comma separated)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Math, Physics'
                          value={(field.value || []).join(", ")}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='tutorProfile.availableDays'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Days (comma separated)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Mon, Tue, Wed'
                            value={(field.value || []).join(", ")}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='tutorProfile.availableTimeSlots'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Available Time Slots (comma separated)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='10 AM – 2 PM, 6 PM – 9 PM'
                            value={(field.value || []).join(", ")}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='tutorProfile.teachingMode'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teaching Mode</FormLabel>
                        <FormControl>
                          <select
                            className='border rounded h-10 px-3'
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value as any)
                            }
                          >
                            <option value=''>Select mode</option>
                            <option value='Online'>Online</option>
                            <option value='Offline'>Offline</option>
                            <option value='Hybrid'>Hybrid</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='tutorProfile.achievements'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Achievements</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Awards, certificates'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Verification Status (read-only if present) */}
                <FormField
                  control={form.control}
                  name='tutorProfile.verificationStatus'
                  as
                  any
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Status</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value as string}
                          disabled
                          placeholder='Pending/Verified/Rejected'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Certificates / Resume</FormLabel>
                  <input
                    type='file'
                    multiple
                    onChange={(e) => handleDocsUpload(e.target.files)}
                  />
                  {Array.isArray(
                    (form.watch("tutorProfile") as any)?.documents
                  ) && (
                    <ul className='mt-2 list-disc pl-5 text-sm'>
                      {(form.watch("tutorProfile") as any)?.documents?.map(
                        (d: any, idx: number) => (
                          <li key={idx}>
                            <a
                              className='text-blue-600 underline'
                              href={d.url}
                              target='_blank'
                              rel='noreferrer'
                            >
                              {d.filename || d.url}
                            </a>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <CardFooter className='flex gap-2'>
              <Button type='submit' disabled={isUpdating || isUploading}>
                {isUpdating ? "Updating..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
