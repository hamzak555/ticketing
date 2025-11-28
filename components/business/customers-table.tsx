'use client'

import { useState } from 'react'
import { Customer } from '@/lib/db/customers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Download, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'

interface CustomersTableProps {
  customers: Customer[]
}

type SortColumn = 'name' | 'email' | 'phone' | 'total_orders' | 'total_spent' | 'first_purchase' | 'last_purchase'
type SortDirection = 'asc' | 'desc'

export function CustomersTable({ customers }: CustomersTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn>('total_spent')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(searchTerm)
    )
  })

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue: string | number = a[sortColumn] ?? ''
    let bValue: string | number = b[sortColumn] ?? ''

    // Handle date comparisons
    if (sortColumn === 'first_purchase' || sortColumn === 'last_purchase') {
      aValue = new Date(aValue as string).getTime()
      bValue = new Date(bValue as string).getTime()
    }

    // Handle string comparisons (case-insensitive)
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Toggle sort
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Render sort icon
  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    )
  }

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV header
    const headers = ['Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'First Purchase', 'Last Purchase']

    // Create CSV rows
    const rows = sortedCustomers.map(customer => [
      customer.name,
      customer.email || '',
      customer.phone || '',
      customer.total_orders.toString(),
      customer.total_spent.toFixed(2),
      new Date(customer.first_purchase).toLocaleDateString(),
      new Date(customer.last_purchase).toLocaleDateString(),
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `customers-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No customers found. Customers will appear here after their first purchase.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  Name
                  {renderSortIcon('name')}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('email')}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  Email
                  {renderSortIcon('email')}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('phone')}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  Phone
                  {renderSortIcon('phone')}
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort('total_orders')}
                  className="flex items-center justify-end w-full hover:text-foreground transition-colors"
                >
                  Orders
                  {renderSortIcon('total_orders')}
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort('total_spent')}
                  className="flex items-center justify-end w-full hover:text-foreground transition-colors"
                >
                  Total Spent
                  {renderSortIcon('total_spent')}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('first_purchase')}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  First Purchase
                  {renderSortIcon('first_purchase')}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('last_purchase')}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  Last Purchase
                  {renderSortIcon('last_purchase')}
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No customers match your search.
                </TableCell>
              </TableRow>
            ) : (
              sortedCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell className="text-right">{customer.total_orders}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(customer.total_spent)}
                  </TableCell>
                  <TableCell>
                    {new Date(customer.first_purchase).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(customer.last_purchase).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {sortedCustomers.length} of {customers.length} customers
      </div>
    </div>
  )
}
