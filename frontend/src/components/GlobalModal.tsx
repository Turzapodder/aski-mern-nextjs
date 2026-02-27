"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { closeModal } from "@/lib/features/ui/uiSlice";
import PostAssignmentModal from "@/components/PostAssignmentModal";

export default function GlobalModal() {
  const dispatch = useAppDispatch();
  const { isOpen, type, data } = useAppSelector((state) => state.ui.globalModal);

  if (!isOpen || !type) return null;

  const handleClose = () => {
    dispatch(closeModal());
  };

  return (
    <>
      {type === "POST_ASSIGNMENT" && (
        <PostAssignmentModal
          isOpen={true}
          onClose={handleClose}
          onSubmit={(submissionData) => {
            console.log("Global Assignment posted:", submissionData);
            // Submit handle logic here, potentially dispatching to an API slice
            handleClose();
          }}
        />
      )}
      {/* Additional modal types can be added here, e.g., type === "CONFIRM_DELETE" */}
    </>
  );
}
