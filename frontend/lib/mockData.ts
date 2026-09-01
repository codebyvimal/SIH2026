import fs from 'fs';
import path from 'path';
import type { EmployeeDashboard } from '@/types/schemas';

export function getEmployeeDashboardMock(): EmployeeDashboard {
  const filePath = path.join(process.cwd(), 'mock_data', 'employee_dashboard.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as EmployeeDashboard;
}
