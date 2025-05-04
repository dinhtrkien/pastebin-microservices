"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "@/components/ui/chart"
import { getPasteAnalytics } from "@/lib/api"
import { Loader2, ChevronLeft, ChevronRight, Calendar, RefreshCcw, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  format,
  subMonths,
  addMonths,
  subYears,
  addYears,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
} from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface PasteAnalyticsProps {
  slug: string
  createdAt: string // ISO date string of when the paste was created
}

type TimeRange = "all" | "monthly" | "yearly"

export default function PasteAnalytics({ slug, createdAt }: PasteAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [totalViews, setTotalViews] = useState(0)
  const [timeRange, setTimeRange] = useState<TimeRange>("all")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [retryCount, setRetryCount] = useState(0)
  const [loadingTime, setLoadingTime] = useState(0)

  // Use a ref to track the loading timer
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Maximum expected loading time in seconds
  const MAX_EXPECTED_LOADING_TIME = 30

  // Parse the creation date once
  const pasteCreationDate = parseISO(createdAt)

  // Calculate date range based on selected time range and current date
  const getDateRange = () => {
    const now = new Date()

    if (timeRange === "all") {
      // Use the paste's creation date as the start date for "all time" view
      return {
        startDate: format(pasteCreationDate, "yyyy-MM-dd"),
        endDate: format(now, "yyyy-MM-dd"),
      }
    } else if (timeRange === "monthly") {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      return {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
      }
    } else if (timeRange === "yearly") {
      const start = startOfYear(currentDate)
      const end = endOfYear(currentDate)
      return {
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
      }
    }

    // Fallback to creation date if something goes wrong
    return {
      startDate: format(pasteCreationDate, "yyyy-MM-dd"),
      endDate: format(now, "yyyy-MM-dd"),
    }
  }

  // Navigate to previous period
  const goToPrevious = () => {
    if (timeRange === "monthly") {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (timeRange === "yearly") {
      setCurrentDate(subYears(currentDate, 1))
    }
  }

  // Navigate to next period
  const goToNext = () => {
    const now = new Date()
    if (timeRange === "monthly") {
      const nextMonth = addMonths(currentDate, 1)
      if (nextMonth <= now) {
        setCurrentDate(nextMonth)
      }
    } else if (timeRange === "yearly") {
      const nextYear = addYears(currentDate, 1)
      if (nextYear <= now) {
        setCurrentDate(nextYear)
      }
    }
  }

  // Get period title based on current selection
  const getPeriodTitle = () => {
    if (timeRange === "all") {
      return `Since ${format(pasteCreationDate, "MMM d, yyyy")}`
    } else if (timeRange === "monthly") {
      return format(currentDate, "MMMM yyyy")
    } else if (timeRange === "yearly") {
      return format(currentDate, "yyyy")
    }
    return ""
  }

  // Start loading timer and progress indicator
  const startLoadingTimers = () => {
    // Clear any existing timers
    if (loadingTimerRef.current) {
      clearInterval(loadingTimerRef.current)
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
    }

    // Reset loading time and progress
    setLoadingTime(0)
    setLoadingProgress(0)

    // Start a timer to track loading time
    loadingTimerRef.current = setInterval(() => {
      setLoadingTime((prev) => prev + 1)
    }, 1000)

    // Start a timer to update progress bar
    progressTimerRef.current = setInterval(() => {
      setLoadingProgress((prev) => {
        // Progress should increase more quickly at first, then slow down
        // This creates a non-linear progress that feels more natural
        const remaining = 100 - prev
        const increment = Math.max(1, Math.floor(remaining / 10))
        return Math.min(95, prev + increment) // Never reach 100% automatically
      })
    }, 500)
  }

  // Stop loading timers
  const stopLoadingTimers = () => {
    if (loadingTimerRef.current) {
      clearInterval(loadingTimerRef.current)
      loadingTimerRef.current = null
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
  }

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      startLoadingTimers()

      const { startDate, endDate } = getDateRange()

      console.log(`Fetching analytics for slug: ${slug}, date range: ${startDate} to ${endDate}`)

      const data = await getPasteAnalytics(slug, startDate, endDate)

      // Set progress to 100% when data is loaded
      setLoadingProgress(100)

      if (data.length === 0) {
        console.log("No analytics data returned")
        setError("No analytics data available for this time period.")
      } else {
        console.log(`Received ${data.length} analytics records`)
        setAnalyticsData(data)

        // Calculate total views
        const total = data.reduce((sum, item) => sum + item.views, 0)
        setTotalViews(total)
      }
    } catch (err: any) {
      console.error("Error in fetchAnalytics:", err)
      setError(err.message || "Failed to load analytics data. Please try again later.")
    } finally {
      stopLoadingTimers()
      setLoading(false)
    }
  }

  // Retry fetching data
  const handleRetry = () => {
    setRetryCount(retryCount + 1)
    fetchAnalytics()
  }

  // Cancel current request and try again
  const handleCancel = () => {
    stopLoadingTimers()
    setLoading(false)
    setError("Request cancelled by user.")
  }

  // Fetch analytics data when time range or current date changes
  useEffect(() => {
    fetchAnalytics()

    // Clean up timers when component unmounts
    return () => {
      stopLoadingTimers()
    }
  }, [slug, timeRange, currentDate, retryCount])

  // Format chart data based on time range
  const formatChartData = () => {
    if (!analyticsData || analyticsData.length === 0) {
      return []
    }

    if (timeRange === "all") {
      // Group by month for all time view
      const monthlyData: Record<string, number> = {}

      analyticsData.forEach((item) => {
        const monthYear = format(new Date(item.dateBucket), "MMM yyyy")
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + item.views
      })

      return Object.entries(monthlyData).map(([date, views]) => ({ date, views }))
    } else if (timeRange === "monthly") {
      // Daily view for monthly data
      return analyticsData.map((item) => ({
        date: format(new Date(item.dateBucket), "d"),
        views: item.views,
      }))
    } else if (timeRange === "yearly") {
      // Monthly view for yearly data
      const monthlyData: Record<string, number> = {}

      analyticsData.forEach((item) => {
        const month = format(new Date(item.dateBucket), "MMM")
        monthlyData[month] = (monthlyData[month] || 0) + item.views
      })

      return Object.entries(monthlyData).map(([date, views]) => ({ date, views }))
    }

    return analyticsData.map((item) => ({
      date: format(new Date(item.dateBucket), "MMM d"),
      views: item.views,
    }))
  }

  const chartData = formatChartData()

  // Check if navigation buttons should be disabled
  const isNextDisabled = () => {
    const now = new Date()
    if (timeRange === "monthly") {
      return format(currentDate, "yyyy-MM") === format(now, "yyyy-MM")
    } else if (timeRange === "yearly") {
      return format(currentDate, "yyyy") === format(now, "yyyy")
    }
    return true
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Paste Analytics</CardTitle>
          <CardDescription>Loading view statistics...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span>Loading analytics data...</span>
            </div>

            <div className="w-full max-w-md space-y-2">
              <Progress value={loadingProgress} className="h-2 w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Please wait, this may take a moment</span>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{loadingTime}s</span>
                </div>
              </div>
            </div>

            {loadingTime > 15 && (
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel Request
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Paste Analytics</CardTitle>
          <CardDescription>There was a problem loading analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={handleRetry} variant="outline" className="flex items-center">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (analyticsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Paste Analytics</CardTitle>
          <CardDescription>No analytics data available for this paste.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Data</AlertTitle>
            <AlertDescription>There are no views recorded for this paste in the selected time period.</AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={handleRetry} variant="outline" className="flex items-center">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Paste Analytics</CardTitle>
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription className="flex justify-between items-center">
          <span>View statistics over time</span>
          <span className="text-sm font-medium">Total Views: {totalViews}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          {timeRange !== "all" ? (
            <>
              <Button variant="outline" size="icon" onClick={goToPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{getPeriodTitle()}</span>
              </div>
              <Button variant="outline" size="icon" onClick={goToNext} disabled={isNextDisabled()}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="flex items-center mx-auto">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{getPeriodTitle()}</span>
            </div>
          )}
        </div>

        <Tabs defaultValue="chart">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [`${value} views`, "Views"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="data">
            <div className="border rounded-md divide-y">
              <div className="grid grid-cols-2 font-medium p-3 bg-muted/50">
                <div>Date</div>
                <div>Views</div>
              </div>
              {analyticsData.map((item, index) => (
                <div key={index} className="grid grid-cols-2 p-3">
                  <div>{new Date(item.dateBucket).toLocaleDateString()}</div>
                  <div>{item.views}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
