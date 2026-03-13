import { Enrollment, Profile, Session } from "@/types";
const RescheduleConfirmationEmail = (params: {
  tutor: Profile;
  student: Profile;
  enrollment: Enrollment;
}) => {
  const { tutor, student, enrollment } = params;
  return `
    Hi ${tutor.firstName}, we are writing to let you know that your enrollment with
    ${student.firstName} ${student.lastName} will deactivate soon 
  `;
};

export default RescheduleConfirmationEmail;
