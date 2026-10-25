export type User = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEAM_MEMBER';
};
export type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  _count?: { tasks: number };
};
export type Status = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Task = {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  project: { id: string; name: string };
  assignee: { id: string; name: string };
};
export type TaskList = {
  tasks: Task[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
export type Dashboard = {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  projects: {
    id: string;
    name: string;
    totalTasks: number;
    completedTasks: number;
    progress: number;
  }[];
};
export type NoticeList = {
  unreadCount: number;
  notifications: {
    id: string;
    taskId: string;
    title: string;
    dueDate: string;
    readAt: string | null;
  }[];
};
export const statusLabel: Record<Status, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};
export const priorityLabel: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};
export function isOverdue(task: Pick<Task, 'dueDate' | 'status'>) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return task.status !== 'COMPLETED' && task.dueDate < today;
}
export function displayDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value + 'T00:00:00Z'));
}
