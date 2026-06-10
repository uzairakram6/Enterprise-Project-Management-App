import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Bell,
  AlertTriangle,
  Clock,
  RefreshCcw,
  CheckCircle2,
  X,
  Send,
  TrendingDown,
  UserX
} from "lucide-react";
import { PROJECTS } from "../data/projects";

interface Alert {
  id: number;
  type: "no-update" | "same-update" | "stuck-task" | "overdue";
  severity: "critical" | "warning" | "info";
  member: string;
  project: string;
  message: string;
  daysCount: number;
  lastUpdate?: string;
  lead: string;
  status: "active" | "resolved" | "snoozed";
  createdAt: string;
}

export default function AlertsNotifications() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      type: "no-update",
      severity: "critical",
      member: "Ahmed Raza",
      project: PROJECTS[0].name,
      message: "No daily update for 3 days",
      daysCount: 3,
      lead: "Hamza Khan (PM)",
      status: "active",
      createdAt: "2026-06-08",
    },
    {
      id: 2,
      type: "same-update",
      severity: "warning",
      member: "Sara Ahmed",
      project: PROJECTS[1].name,
      message: "Same daily update for 3 consecutive days - may be stuck",
      daysCount: 3,
      lastUpdate: "Working on authentication integration",
      lead: "Hamza Khan (PM)",
      status: "active",
      createdAt: "2026-06-08",
    },
    {
      id: 3,
      type: "stuck-task",
      severity: "warning",
      member: "Usman Khan",
      project: PROJECTS[0].name,
      message: "Working on same parent task for 5 days without completion",
      daysCount: 5,
      lastUpdate: "GTS — Route Optimization API",
      lead: "Hamza Khan (PM)",
      status: "active",
      createdAt: "2026-06-07",
    },
    {
      id: 4,
      type: "no-update",
      severity: "critical",
      member: "Fatima Malik",
      project: PROJECTS[2].name,
      message: "No daily update for 4 days",
      daysCount: 4,
      lead: "Uzair (PM)",
      status: "active",
      createdAt: "2026-06-06",
    },
  ]);

  const [resolvedAlerts] = useState<Alert[]>([
    {
      id: 5,
      type: "same-update",
      severity: "warning",
      member: "Ali Hassan",
      project: PROJECTS[0].name,
      message: "Same daily update for 3 consecutive days",
      daysCount: 3,
      lastUpdate: "Database schema implementation",
      lead: "Hamza Khan (PM)",
      status: "resolved",
      createdAt: "2026-06-05",
    },
  ]);

  const activeAlerts = alerts.filter(a => a.status === "active");
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical");
  const warningAlerts = activeAlerts.filter(a => a.severity === "warning");

  const handleSendReminder = (alertId: number) => {
    alert("Reminder sent to team member and lead!");
    // In real implementation, this would trigger email/Slack notification
  };

  const handleResolve = (alertId: number) => {
    setAlerts(alerts.map(a =>
      a.id === alertId ? { ...a, status: "resolved" as const } : a
    ));
  };

  const handleSnooze = (alertId: number) => {
    setAlerts(alerts.map(a =>
      a.id === alertId ? { ...a, status: "snoozed" as const } : a
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "warning":
        return "bg-amber-500";
      default:
        return "bg-blue-500";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "no-update":
        return <UserX className="w-5 h-5" />;
      case "same-update":
        return <RefreshCcw className="w-5 h-5" />;
      case "stuck-task":
        return <Clock className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Alerts & Notifications</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered monitoring for team updates and task progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {criticalAlerts.length} Critical
          </Badge>
          <Badge className="bg-amber-500 text-lg px-3 py-1">
            {warningAlerts.length} Warnings
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-500">{criticalAlerts.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-3 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Warnings</p>
              <p className="text-2xl font-bold text-amber-500">{warningAlerts.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved Today</p>
              <p className="text-2xl font-bold text-green-500">{resolvedAlerts.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingDown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Resolution</p>
              <p className="text-2xl font-bold">1.2 days</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active Alerts ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <div>
              <h2 className="text-xl mb-4 flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Critical Alerts
              </h2>
              <div className="space-y-3">
                {criticalAlerts.map((alert) => (
                  <Card key={alert.id} className="p-4 border-red-200 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3 flex-1">
                        <div className="text-red-600 mt-1">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-lg">{alert.member}</h3>
                            <Badge variant="destructive">Critical</Badge>
                            <Badge variant="outline">{alert.project}</Badge>
                          </div>
                          <p className="text-sm text-red-900 font-medium mb-2">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Days: {alert.daysCount}</span>
                            <span>Lead: {alert.lead}</span>
                            <span>Created: {new Date(alert.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => handleSendReminder(alert.id)}
                        >
                          <Send className="w-4 h-4" />
                          Send Reminder
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolve(alert.id)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSnooze(alert.id)}
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Warning Alerts */}
          {warningAlerts.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl mb-4 flex items-center gap-2 text-amber-600">
                <Clock className="w-5 h-5" />
                Warnings
              </h2>
              <div className="space-y-3">
                {warningAlerts.map((alert) => (
                  <Card key={alert.id} className="p-4 border-amber-200 bg-amber-50">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3 flex-1">
                        <div className="text-amber-600 mt-1">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-lg">{alert.member}</h3>
                            <Badge className="bg-amber-500">Warning</Badge>
                            <Badge variant="outline">{alert.project}</Badge>
                          </div>
                          <p className="text-sm text-amber-900 font-medium mb-2">
                            {alert.message}
                          </p>
                          {alert.lastUpdate && (
                            <p className="text-sm text-amber-800 mb-2">
                              <strong>Repeated update:</strong> "{alert.lastUpdate}"
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Days: {alert.daysCount}</span>
                            <span>Lead: {alert.lead}</span>
                            <span>Created: {new Date(alert.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          className="gap-2 bg-amber-500 hover:bg-amber-600"
                          onClick={() => handleSendReminder(alert.id)}
                        >
                          <Send className="w-4 h-4" />
                          Alert Lead
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolve(alert.id)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSnooze(alert.id)}
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4 mt-6">
          <div className="space-y-3">
            {resolvedAlerts.map((alert) => (
              <Card key={alert.id} className="p-4 opacity-60">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="text-green-600 mt-1">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{alert.member}</h3>
                        <Badge className="bg-green-500">Resolved</Badge>
                        <Badge variant="outline">{alert.project}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card className="p-6">
            <h2 className="text-xl mb-4">Alert Configuration</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">No Update Alert</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Trigger alert when team member doesn't submit daily update
                </p>
                <div className="flex items-center gap-4">
                  <label className="text-sm">Days without update:</label>
                  <input
                    type="number"
                    defaultValue="3"
                    className="w-20 px-3 py-2 border rounded-lg"
                    min="1"
                    max="7"
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Same Update Alert</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Trigger alert when team member submits identical update repeatedly
                </p>
                <div className="flex items-center gap-4">
                  <label className="text-sm">Consecutive same updates:</label>
                  <input
                    type="number"
                    defaultValue="3"
                    className="w-20 px-3 py-2 border rounded-lg"
                    min="2"
                    max="5"
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Stuck on Task Alert</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Trigger alert when team member works on same parent task without completion
                </p>
                <div className="flex items-center gap-4">
                  <label className="text-sm">Days on same task:</label>
                  <input
                    type="number"
                    defaultValue="5"
                    className="w-20 px-3 py-2 border rounded-lg"
                    min="3"
                    max="10"
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Notification Recipients</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Send to team member</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Send to project lead (PM/DM)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm">Send to engineering manager</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Notification Channels</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Slack</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm">SMS</span>
                  </label>
                </div>
              </div>

              <Button>Save Configuration</Button>
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900">
                  <strong>AI-Powered Monitoring:</strong> System automatically analyzes daily updates
                  and triggers alerts based on configured thresholds. Alerts are sent via email and Slack.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
