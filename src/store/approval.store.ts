import { create } from "zustand";
import { persist } from "zustand/middleware";

type ApprovalStatus = "pending" | "approved" | "rejected";

interface ApprovalState {
  reservationStatuses: Record<string, ApprovalStatus>;
  eventStatuses: Record<string, ApprovalStatus>;
  setReservationStatus: (id: string, status: ApprovalStatus) => void;
  setEventStatus: (id: string, status: ApprovalStatus) => void;
}

export const useApprovalStore = create<ApprovalState>()(
  persist(
    (set) => ({
      reservationStatuses: {},
      eventStatuses: {},
      setReservationStatus: (id, status) =>
        set((s) => ({ reservationStatuses: { ...s.reservationStatuses, [id]: status } })),
      setEventStatus: (id, status) =>
        set((s) => ({ eventStatuses: { ...s.eventStatuses, [id]: status } })),
    }),
    { name: "unievent-approvals" }
  )
);
