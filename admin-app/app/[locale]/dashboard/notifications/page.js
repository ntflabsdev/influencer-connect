"use client";

import { useState, useEffect } from 'react';
import { adminApi } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import Badge from '../../../../components/Badge.js';
import { useToast } from '../../../../components/ToastProvider.js';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    read: '',
    type: '',
    priority: ''
  });
  const [pagination, setPagination] = useState(null);
  const { push } = useToast();

  useEffect(() => {
    loadNotifications();
  }, [filters]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const data = await adminApi(`/notifications?${queryParams.toString()}`);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setPagination(data.pagination);
    } catch (error) {
      push('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await adminApi(`/notifications/${notificationId}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, read: true, readAt: new Date() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      push('Notification marked as read', 'success');
    } catch (error) {
      push('Failed to mark notification as read', 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      await adminApi('/notifications/read-all', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date() })));
      setUnreadCount(0);
      push('All notifications marked as read', 'success');
    } catch (error) {
      push('Failed to mark all as read', 'error');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await adminApi(`/notifications/${notificationId}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      push('Notification deleted', 'success');
    } catch (error) {
      push('Failed to delete notification', 'error');
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now - notifDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return notifDate.toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Notifications</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification(s)` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <Button variant="secondary" onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
          <Button variant="secondary" onClick={loadNotifications} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={filters.read}
              onChange={(e) => setFilters(prev => ({ ...prev, read: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
            >
              <option value="">All</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
            >
              <option value="">All Types</option>
              <option value="user_pending_approval">User Pending Approval</option>
              <option value="kyc_pending_review">KYC Pending Review</option>
              <option value="content_pending_moderation">Content Pending Moderation</option>
              <option value="dispute_created">Dispute Created</option>
              <option value="ticket_assigned">Ticket Assigned</option>
              <option value="bulk_action_complete">Bulk Action Complete</option>
              <option value="report_ready">Report Ready</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No notifications found
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-colors ${
                  !notif.read ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      {notif.priority && notif.priority !== 'normal' && (
                        <Badge variant={getPriorityColor(notif.priority)} size="sm">
                          {notif.priority}
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>{formatTime(notif.createdAt)}</span>
                      {notif.type && (
                        <Badge variant="secondary" size="sm">
                          {notif.type.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notif._id)}
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNotification(notif._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} notifications
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm text-slate-700 dark:text-slate-300">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
