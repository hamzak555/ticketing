import { AdminUsersManagement } from '@/components/admin/users-management'
import { AdminDashboardLayout } from '@/components/admin/admin-dashboard-layout'

export default function AdminUsersPage() {
  return (
    <AdminDashboardLayout>
      <AdminUsersManagement />
    </AdminDashboardLayout>
  )
}
