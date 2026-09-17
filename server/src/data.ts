import type { ActionItem } from "../../shared/actions";

export const starterActions: ActionItem[] = [
  {
    id: "A001",
    client: "Kopano School",
    title: "Confirm pilot user numbers",
    owner: "Mac",
    dueDate: "2026-09-18",
    priority: "High",
    status: "Open"
  },
  {
    id: "A002",
    client: "ANAK",
    title: "Complete UAT readiness review",
    owner: "Nonofo",
    dueDate: "2026-09-19",
    priority: "High",
    status: "In Progress"
  },
  {
    id: "A003",
    client: "BusBox",
    title: "Follow up with payment partner",
    owner: "Mac",
    dueDate: "2026-09-20",
    priority: "High",
    status: "Open"
  },
  {
    id: "A004",
    client: "Khwai Group",
    title: "Review recruitment priorities",
    owner: "Donald",
    dueDate: "2026-09-22",
    priority: "Medium",
    status: "Open"
  },
  {
    id: "A005",
    client: "Structura",
    title: "Prepare interview schedule",
    owner: "Donald",
    dueDate: "2026-09-23",
    priority: "Medium",
    status: "In Progress"
  },
  {
    id: "A006",
    client: "BusBox",
    title: "Archive pilot meeting notes",
    owner: "Mac",
    dueDate: "2026-09-25",
    priority: "Low",
    status: "Completed"
  }
];

export function cloneStarterActions() {
  return starterActions.map((action) => ({ ...action }));
}
