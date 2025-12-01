// client/src/lib/utils.js
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = 'KES') {
  return `${currency} ${amount.toLocaleString()}`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getDaysPastDue(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export function getStatusColor(status) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    disbursed: 'bg-purple-100 text-purple-800',
    closed: 'bg-gray-100 text-gray-800',
    defaulted: 'bg-red-100 text-red-800',
    blacklisted: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-orange-100 text-orange-800',
    overdue: 'bg-red-100 text-red-800'
  };
  return colors[status] || colors.inactive;
}