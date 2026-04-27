"use client";

import { useEffect, useState } from 'react';
import { adminApi } from '../../../../lib/api.js';
import Card from '../../../../components/Card.js';
import Button from '../../../../components/Button.js';
import Badge from '../../../../components/Badge.js';

export default function ContentModerationPage() {
  const [submissions, setSubmissions] = useState([]);
  const [flaggedSubmissions, setFlaggedSubmissions] = useState([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [qualityAnalytics, setQualityAnalytics] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const tabs = [
    { id: 'pending', label: 'Pending Review', count: submissions.filter(s => s.status === 'pending').length },
    { id: 'flagged', label: 'AI Flagged', count: flaggedSubmissions.length },
    { id: 'analytics', label: 'Quality Analytics' }
  ];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const data = await adminApi('/submissions?status=pending&limit=50');
        setSubmissions(data.submissions || []);
      } else if (activeTab === 'flagged') {
        const data = await adminApi('/content/flagged');
        setFlaggedSubmissions(data.submissions || []);
      } else if (activeTab === 'analytics') {
        const data = await adminApi('/content/analytics/quality?period=30d');
        setQualityAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeWithAI = async (submissionId) => {
    try {
      const data = await adminApi(`/content/analyze/${submissionId}`, { method: 'POST' });
      // Update the submission in the list
      setSubmissions(prev => prev.map(s =>
        s._id === submissionId ? data.submission : s
      ));
      setFlaggedSubmissions(prev => prev.map(s =>
        s._id === submissionId ? data.submission : s
      ));
    } catch (error) {
      console.error('AI analysis failed:', error);
    }
  };

  const bulkAnalyzeAI = async () => {
    if (selectedSubmissions.length === 0) return;

    try {
      await adminApi('/content/bulk-analyze', {
        method: 'POST',
        body: { submissionIds: selectedSubmissions }
      });
      loadData();
      setSelectedSubmissions([]);
    } catch (error) {
      console.error('Bulk AI analysis failed:', error);
    }
  };

  const bulkModerate = async (action, feedback = '') => {
    if (selectedSubmissions.length === 0) return;

    try {
      await adminApi('/content/bulk-moderate', {
        method: 'POST',
        body: {
          submissionIds: selectedSubmissions,
          action,
          feedback
        }
      });
      loadData();
      setSelectedSubmissions([]);
    } catch (error) {
      console.error('Bulk moderation failed:', error);
    }
  };

  const reviewSubmission = async (submissionId, status, feedback = '') => {
    try {
      await adminApi(`/submissions/${submissionId}`, {
        method: 'PATCH',
        body: { status, feedback }
      });
      loadData();
      if (selectedSubmission?._id === submissionId) {
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error('Review failed:', error);
    }
  };

  const toggleSelection = (submissionId) => {
    setSelectedSubmissions(prev =>
      prev.includes(submissionId)
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const toggleAll = () => {
    const currentList = activeTab === 'pending' ? submissions : flaggedSubmissions;
    const allIds = currentList.map(s => s._id);

    if (selectedSubmissions.length === currentList.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(allIds);
    }
  };

  const getRiskBadgeColor = (score) => {
    if (score >= 0.8) return 'danger';
    if (score >= 0.6) return 'warning';
    if (score >= 0.4) return 'info';
    return 'success';
  };

  const getRiskLabel = (score) => {
    if (score >= 0.8) return 'High Risk';
    if (score >= 0.6) return 'Medium Risk';
    if (score >= 0.4) return 'Low Risk';
    return 'Safe';
  };

  const renderPendingTab = () => (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedSubmissions.length > 0 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedSubmissions.length} submission{selectedSubmissions.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={bulkAnalyzeAI}
              >
                Analyze with AI
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => bulkModerate('approve', 'Bulk approved by admin')}
              >
                Bulk Approve
              </Button>
              <Button
                variant="warning"
                size="sm"
                onClick={() => bulkModerate('request_changes', 'Changes requested via bulk action')}
              >
                Request Changes
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => bulkModerate('reject', 'Rejected via bulk action')}
              >
                Bulk Reject
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Submissions List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Pending Content Submissions</h3>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedSubmissions.length === submissions.length && submissions.length > 0}
              onChange={toggleAll}
              className="rounded"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">Select All</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No pending submissions
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission._id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedSubmissions.includes(submission._id)}
                    onChange={() => toggleSelection(submission._id)}
                    className="mt-1"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="warning">Pending</Badge>
                        {submission.aiModeration?.score && (
                          <Badge variant={getRiskBadgeColor(submission.aiModeration.score)}>
                            {getRiskLabel(submission.aiModeration.score)}
                          </Badge>
                        )}
                        {submission.priority && submission.priority !== 'normal' && (
                          <Badge variant={submission.priority === 'urgent' ? 'danger' : 'warning'}>
                            {submission.priority.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {submission.application?.offer?.title || 'Offer'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          by {submission.application?.influencer?.name || 'Unknown Influencer'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          {submission.caption || 'No caption'}
                        </p>
                        <a
                          href={submission.assetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View Content →
                        </a>
                      </div>
                    </div>

                    {/* AI Flags */}
                    {submission.aiModeration?.flags?.length > 0 && (
                      <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                          AI Flags Detected:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {submission.aiModeration.flags.map((flag, index) => (
                            <Badge key={index} variant="warning" className="text-xs">
                              {flag.type}: {(flag.confidence * 100).toFixed(0)}%
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => analyzeWithAI(submission._id)}
                        disabled={submission.aiModeration?.processedAt}
                      >
                        {submission.aiModeration?.processedAt ? 'AI Analyzed' : 'Analyze AI'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        Review
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => reviewSubmission(submission._id, 'approved', 'Approved by admin')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => reviewSubmission(submission._id, 'changes_requested', 'Changes requested')}
                      >
                        Request Changes
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => reviewSubmission(submission._id, 'rejected', 'Rejected by admin')}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const renderFlaggedTab = () => (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">AI Flagged Content</h3>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedSubmissions.length === flaggedSubmissions.length && flaggedSubmissions.length > 0}
              onChange={toggleAll}
              className="rounded"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">Select All</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading flagged submissions...</div>
        ) : flaggedSubmissions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No AI flagged content
          </div>
        ) : (
          <div className="space-y-4">
            {flaggedSubmissions.map((submission) => (
              <div key={submission._id} className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedSubmissions.includes(submission._id)}
                    onChange={() => toggleSelection(submission._id)}
                    className="mt-1"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="danger">
                          Risk Score: {(submission.aiModeration.score * 100).toFixed(0)}%
                        </Badge>
                        <Badge variant="warning">Flagged</Badge>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {submission.application?.offer?.title || 'Offer'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          by {submission.application?.influencer?.name || 'Unknown Influencer'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          {submission.caption || 'No caption'}
                        </p>
                        <a
                          href={submission.assetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View Content →
                        </a>
                      </div>
                    </div>

                    {/* AI Flags Details */}
                    <div className="mb-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                        AI Detection Results:
                      </p>
                      <div className="space-y-1">
                        {submission.aiModeration.flags.map((flag, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-red-700 dark:text-red-300">{flag.type}</span>
                            <span className="text-red-600 dark:text-red-400">
                              {(flag.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        Review Details
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => reviewSubmission(submission._id, 'approved', 'Manually approved despite AI flags')}
                      >
                        Override Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => reviewSubmission(submission._id, 'rejected', 'Rejected based on AI analysis')}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {qualityAnalytics ? (
        <>
          {/* Quality Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Submissions</p>
                  <p className="text-2xl font-bold">{qualityAnalytics.qualityMetrics.totalSubmissions}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <span className="text-xl">⭐</span>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Avg Quality Score</p>
                  <p className="text-2xl font-bold">{qualityAnalytics.qualityMetrics.avgOverall?.toFixed(1) || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">AI Analyzed</p>
                  <p className="text-2xl font-bold">{qualityAnalytics.moderationStats?.find(s => s._id === 'pending')?.count || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <span className="text-xl">⚠️</span>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Flagged Content</p>
                  <p className="text-2xl font-bold text-orange-600">{qualityAnalytics.aiFlaggingTrends?.reduce((sum, t) => sum + (t.highRiskCount || 0), 0) || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Moderation Status Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Content Moderation Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {qualityAnalytics.moderationStats?.map((status) => (
                <div key={status._id} className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{status.count}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">{status._id}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Flagging Trends */}
          {qualityAnalytics.aiFlaggingTrends?.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">AI Flagging Trends</h3>
              <div className="space-y-3">
                {qualityAnalytics.aiFlaggingTrends.slice(0, 7).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(trend._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-900 dark:text-slate-100">
                        Risk: {(trend.avgRiskScore * 100).toFixed(0)}%
                      </span>
                      <Badge variant={trend.highRiskCount > 0 ? 'danger' : 'success'}>
                        {trend.highRiskCount} high risk
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No analytics data available
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Quality analytics will appear once content submissions are processed.
            </p>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Content Moderation</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            AI-powered content review and quality control
          </p>
        </div>
        <Button variant="primary" onClick={loadData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <Badge variant={tab.id === 'flagged' ? 'danger' : 'warning'} className="ml-2">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'pending' && renderPendingTab()}
      {activeTab === 'flagged' && renderFlaggedTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Content Review</h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedSubmission.application?.offer?.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    by {selectedSubmission.application?.influencer?.name}
                  </p>
                </div>

                <div>
                  <img
                    src={selectedSubmission.assetUrl}
                    alt="Content"
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                </div>

                {selectedSubmission.caption && (
                  <div>
                    <h4 className="font-medium mb-2">Caption</h4>
                    <p className="text-slate-600 dark:text-slate-400">{selectedSubmission.caption}</p>
                  </div>
                )}

                {selectedSubmission.aiModeration?.flags?.length > 0 && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-medium mb-2 text-yellow-800 dark:text-yellow-200">AI Analysis</h4>
                    <div className="space-y-2">
                      {selectedSubmission.aiModeration.flags.map((flag, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-yellow-700 dark:text-yellow-300">{flag.type}</span>
                          <Badge variant="warning">
                            {(flag.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="success"
                    onClick={() => reviewSubmission(selectedSubmission._id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="warning"
                    onClick={() => reviewSubmission(selectedSubmission._id, 'changes_requested')}
                  >
                    Request Changes
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => reviewSubmission(selectedSubmission._id, 'rejected')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedSubmission(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}