export interface CreateReportPayload {
  reporterType: "user" | "tutor";
  reportedType: "assignment" | "tutorProfile" | "userProfile";
  reportedId: string;
  reason: string;
  comments?: string;
}
