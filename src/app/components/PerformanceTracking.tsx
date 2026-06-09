import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Target, Award, AlertCircle, Users } from "lucide-react";

const projectHealthData = [
  { name: "Week 19", green: 18, amber: 4, red: 2 },
  { name: "Week 20", green: 19, amber: 3, red: 2 },
  { name: "Week 21", green: 17, amber: 5, red: 2 },
  { name: "Week 22", green: 20, amber: 3, red: 1 },
  { name: "Week 23", green: 18, amber: 6, red: 0 },
];

const resourceComplianceData = [
  { name: "Ahmed Khan", compliance: 98, updates: 47 },
  { name: "Sarah Ali", compliance: 95, updates: 45 },
  { name: "Hassan Malik", compliance: 92, updates: 44 },
  { name: "Fatima Noor", compliance: 88, updates: 42 },
  { name: "Omar Farooq", compliance: 85, updates: 40 },
  { name: "Aisha Rahman", compliance: 96, updates: 46 },
  { name: "Bilal Ahmed", compliance: 90, updates: 43 },
  { name: "Zainab Hussain", compliance: 94, updates: 45 },
];

const projectDistribution = [
  { name: "On Track", value: 18, color: "#22c55e" },
  { name: "At Risk", value: 6, color: "#f59e0b" },
  { name: "Delayed", value: 0, color: "#ef4444" },
];

const deliveryMetrics = [
  { name: "Jan", delivered: 12, planned: 15 },
  { name: "Feb", delivered: 18, planned: 18 },
  { name: "Mar", delivered: 22, planned: 20 },
  { name: "Apr", delivered: 19, planned: 22 },
  { name: "May", delivered: 24, planned: 24 },
  { name: "Jun", delivered: 15, planned: 20 },
];

const teamPerformance = [
  { name: "Engineering", score: 92, members: 45, projects: 12 },
  { name: "Design", score: 88, members: 12, projects: 8 },
  { name: "Quality", score: 95, members: 18, projects: 10 },
  { name: "DevOps", score: 90, members: 8, projects: 6 },
  { name: "Management", score: 85, members: 15, projects: 24 },
];

export default function PerformanceTracking() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Performance Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Analytics and insights across projects, teams, and resources
          </p>
        </div>
        <Select defaultValue="ytd">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Update Compliance</p>
              <p className="text-3xl mt-2">94%</p>
              <div className="flex items-center gap-1 mt-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+2% from last month</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Delivery Success</p>
              <p className="text-3xl mt-2">89%</p>
              <div className="flex items-center gap-1 mt-2 text-amber-600">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm">-3% from last month</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Team Score</p>
              <p className="text-3xl mt-2">90</p>
              <div className="flex items-center gap-1 mt-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+5 points</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Projects at Risk</p>
              <p className="text-3xl mt-2">6</p>
              <div className="flex items-center gap-1 mt-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Needs attention</span>
              </div>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl mb-6">Project Health Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectHealthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="green" name="On Track" fill="#22c55e" />
                  <Bar dataKey="amber" name="At Risk" fill="#f59e0b" />
                  <Bar dataKey="red" name="Delayed" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl mb-6">Current Status Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl mb-6">Top Performers - Update Compliance</h2>
            <div className="space-y-4">
              {resourceComplianceData.map((resource, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-8 text-center">
                    <Badge variant={idx < 3 ? "default" : "secondary"}>
                      #{idx + 1}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{resource.name}</p>
                    <p className="text-sm text-muted-foreground">{resource.updates} updates submitted</p>
                  </div>
                  <div className="w-32">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            resource.compliance >= 95
                              ? "bg-green-500"
                              : resource.compliance >= 90
                              ? "bg-blue-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${resource.compliance}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-10 text-right">{resource.compliance}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl mb-6">Delivery Performance - 2026</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={deliveryMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="delivered"
                  name="Delivered"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="planned"
                  name="Planned"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">110</p>
                <p className="text-sm text-muted-foreground">Total Delivered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">119</p>
                <p className="text-sm text-muted-foreground">Total Planned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">92%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamPerformance.map((team, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg">{team.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {team.members} members • {team.projects} projects
                    </p>
                  </div>
                  <Badge variant={team.score >= 90 ? "default" : "secondary"}>
                    Score: {team.score}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Performance</span>
                      <span>{team.score}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          team.score >= 90 ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${team.score}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Utilization</p>
                      <p className="font-medium">94%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Compliance</p>
                      <p className="font-medium">96%</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Insights */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex gap-4">
          <div className="bg-blue-600 p-3 rounded-lg h-fit">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">AI-Powered Insights</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Quality team is performing 12% above average with 95% update compliance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>Mobile App project has had amber status for 3 consecutive weeks - consider resource reallocation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Engineering team delivery rate improved by 8% this quarter after implementing daily standups</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
