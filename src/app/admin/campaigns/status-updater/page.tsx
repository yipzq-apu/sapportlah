'use client';

import { useState, useEffect } from 'react';

interface Campaign {
  id: number;
  title: string;
  start_date?: string;
  end_date?: string;
  current_amount?: number;
  goal_amount?: number;
  new_status?: string;
}

export default function CampaignStatusUpdaterPage() {
  const [loading, setLoading] = useState(false);
  const [campaignsToActivate, setCampaignsToActivate] = useState<Campaign[]>(
    []
  );
  const [campaignsToComplete, setCampaignsToComplete] = useState<Campaign[]>(
    []
  );
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    fetchPendingUpdates();
  }, []);

  const fetchPendingUpdates = async () => {
    try {
      const response = await fetch('/api/admin/campaigns/update-statuses');
      if (response.ok) {
        const data = await response.json();
        setCampaignsToActivate(data.campaignsToActivate || []);
        setCampaignsToComplete(data.campaignsToComplete || []);
      }
    } catch (error) {
      console.error('Error fetching pending updates:', error);
    }
  };

  const runStatusUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/campaigns/update-statuses', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setLastUpdate(new Date().toLocaleString());
        alert(
          `Status update completed!\nActivated: ${data.updates.activatedToday}\nCompleted: ${data.updates.completedYesterday}`
        );
        fetchPendingUpdates(); // Refresh the list
      } else {
        alert('Failed to update campaign statuses');
      }
    } catch (error) {
      console.error('Error updating statuses:', error);
      alert('Error updating campaign statuses');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Campaign Status Updater
          </h1>
          <p className="text-gray-600">
            Monitor and update campaign statuses. Automatic updates run daily at
            12:00 AM UTC.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchPendingUpdates}
            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
          >
            Refresh
          </button>
          <button
            onClick={runStatusUpdate}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Manual Update'}
          </button>
        </div>
      </div>

      {/* Automation Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-green-600 text-xl mr-3">🤖</span>
          <div>
            <h4 className="text-sm font-medium text-green-900">
              Automatic Updates Enabled
            </h4>
            <p className="text-sm text-green-800 mt-1">
              Campaign statuses are automatically updated daily at 12:00 AM UTC.
              Manual updates are available for immediate processing.
            </p>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Ready to Activate
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {campaignsToActivate.length}
          </p>
          <p className="text-xs text-gray-500">
            Approved campaigns with start date today
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Ready to Complete
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {campaignsToComplete.length}
          </p>
          <p className="text-xs text-gray-500">
            Active campaigns past end date
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Last Update</h3>
          <p className="text-sm font-bold text-gray-900">
            {lastUpdate || 'Not run yet'}
          </p>
          <p className="text-xs text-gray-500">Manual update timestamp</p>
        </div>
      </div>

      {/* Campaigns to Activate */}
      {campaignsToActivate.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Campaigns Ready to Activate ({campaignsToActivate.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaignsToActivate.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {campaign.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {campaign.start_date && formatDate(campaign.start_date)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Will activate
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaigns to Complete */}
      {campaignsToComplete.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Campaigns Ready to Complete ({campaignsToComplete.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Funding Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    New Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaignsToComplete.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {campaign.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {campaign.end_date && formatDate(campaign.end_date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {campaign.current_amount !== undefined &&
                          campaign.goal_amount !== undefined && (
                            <>
                              {formatCurrency(campaign.current_amount)} /{' '}
                              {formatCurrency(campaign.goal_amount)}
                              <div className="text-xs text-gray-500">
                                {(
                                  (campaign.current_amount /
                                    campaign.goal_amount) *
                                  100
                                ).toFixed(1)}
                                % funded
                              </div>
                            </>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          campaign.new_status === 'successful'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {campaign.new_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {campaignsToActivate.length === 0 && campaignsToComplete.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-gray-400 text-4xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            All Campaigns Up to Date
          </h3>
          <p className="text-gray-600">
            No campaigns require status updates at this time.
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Status Update Schedule:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • <strong>Automatic:</strong> Daily at 12:00 AM UTC via cron job
          </li>
          <li>
            • <strong>Manual:</strong> Available anytime via the "Manual Update"
            button
          </li>
          <li>
            • <strong>Approved → Active:</strong> When start_date is reached
          </li>
          <li>
            • <strong>Active → Successful:</strong> The day after end_date if
            goal is met
          </li>
          <li>
            • <strong>Active → Failed:</strong> The day after end_date if goal
            is not met
          </li>
        </ul>
      </div>
    </div>
  );
}
