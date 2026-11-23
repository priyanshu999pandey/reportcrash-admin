import axios from "axios";
import { FileText, Hospital, LoaderCircle, Siren, Users } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Table from "../components/baseComponents/Table";
import AccidentReportsTrend from "../components/dashboard/AccidentReportsTrend";
import AccidentTypeDistribution from "../components/dashboard/AccidentTypeDistribution";
import DateRangePicker from "../components/baseComponents/DateRangePicker";
import StatisticCard from "../components/baseComponents/StatisticCard";
import { apiUrls } from "../config/api";
import {
  setAccidentReports,
  setAccidentReportsError,
  setAccidentReportsLoading,
} from "../store/accidentReportSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type {
  AccidentReportsApiResponse,
  SosAlertRow,
  TableColumn,
  TableRow,
  TrendPeriod,
  TrendPoint,
} from "../types";

const trendMockData: Record<TrendPeriod, TrendPoint[]> = {
  30: [
    { label: "01 Oct", reports: 14 },
    { label: "05 Oct", reports: 28 },
    { label: "09 Oct", reports: 21 },
    { label: "13 Oct", reports: 46 },
    { label: "17 Oct", reports: 39 },
    { label: "21 Oct", reports: 69 },
    { label: "25 Oct", reports: 51 },
    { label: "31 Oct", reports: 80 },
  ],
  45: [
    { label: "18 Sep", reports: 10 },
    { label: "23 Sep", reports: 19 },
    { label: "28 Sep", reports: 25 },
    { label: "03 Oct", reports: 18 },
    { label: "08 Oct", reports: 43 },
    { label: "13 Oct", reports: 36 },
    { label: "18 Oct", reports: 58 },
    { label: "23 Oct", reports: 65 },
    { label: "28 Oct", reports: 52 },
    { label: "02 Nov", reports: 84 },
  ],
  60: [
    { label: "03 Sep", reports: 8 },
    { label: "08 Sep", reports: 16 },
    { label: "13 Sep", reports: 22 },
    { label: "18 Sep", reports: 17 },
    { label: "23 Sep", reports: 30 },
    { label: "28 Sep", reports: 41 },
    { label: "03 Oct", reports: 34 },
    { label: "08 Oct", reports: 49 },
    { label: "13 Oct", reports: 63 },
    { label: "18 Oct", reports: 57 },
    { label: "23 Oct", reports: 72 },
    { label: "28 Oct", reports: 55 },
    { label: "02 Nov", reports: 88 },
  ],
};

const recentSosAlerts: SosAlertRow[] = [
  {
    id: "alert-1",
    user: "Rohit Sharma",
    location: "Sector 24, Gurugram",
    date: "25 Jun 2026",
    time: "05:12 PM",
  },
  {
    id: "alert-2",
    user: "Priya Singh",
    location: "NH-48, Delhi",
    date: "25 Jun 2026",
    time: "04:32 PM",
  },
  {
    id: "alert-3",
    user: "Amit Kumar",
    location: "Sector 62, Noida",
    date: "25 Jun 2026",
    time: "03:18 PM",
  },
  {
    id: "alert-4",
    user: "Neha Verma",
    location: "Dwarka, Delhi",
    date: "25 Jun 2026",
    time: "02:50 PM",
  },
];

const recentAccidentColumns: TableColumn[] = [
  {
    key: "report-id",
    header: "Report ID",
  },
  {
    key: "accident-type",
    header: "Accident Type",
  },
  {
    key: "location",
    header: "Location",
  },
  {
    key: "date-time",
    header: "Date & Time",
  },
];

const recentSosColumns: TableColumn[] = [
  {
    key: "serial-number",
    header: "#",
  },
  {
    key: "user",
    header: "User",
  },
  {
    key: "location",
    header: "Location",
  },
  {
    key: "date-time",
    header: "Date & Time",
  },
];

const recentSosTableRows: TableRow[] = recentSosAlerts.map((alert, index) => ({
  key: alert.id,
  cells: {
    "serial-number": index + 1,
    user: alert.user,
    location: alert.location,
    "date-time": (
      <>
        <span className="block">{alert.date}</span>
        <span className="block">{alert.time}</span>
      </>
    ),
  },
}));

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const {
    items: accidentReports,
    total: totalAccidentReports,
    isLoading: areAccidentReportsLoading,
    error: accidentReportsError,
  } = useAppSelector((state) => state.accidentReports);

  useEffect(() => {
    const controller = new AbortController();

    const loadAccidentReports = async () => {
      dispatch(setAccidentReportsLoading(true));
      dispatch(setAccidentReportsError(""));

      try {
        const response = await axios.get(apiUrls.accidentReports, {
          signal: controller.signal,
        });
        const result = response.data as AccidentReportsApiResponse;
        dispatch(
          setAccidentReports({
            items: result.data.filter((report) => !report.isDeleted),
            total: result.count,
          }),
        );
      } catch (requestError: unknown) {
        if (axios.isCancel(requestError)) return;
        dispatch(
          setAccidentReportsError(
            axios.isAxiosError(requestError)
              ? (requestError.response?.data?.message ?? requestError.message)
              : "Unable to load accident reports.",
          ),
        );
      } finally {
        if (!controller.signal.aborted) {
          dispatch(setAccidentReportsLoading(false));
        }
      }
    };

    void loadAccidentReports();
    return () => controller.abort();
  }, [dispatch]);

  const recentAccidentTableRows: TableRow[] = [...accidentReports]
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .slice(0, 4)
    .map((report) => {
      const reportedAt = new Date(report.createdAt);
      const location = [
        report.location.address,
        report.location.city,
        report.location.state,
      ]
        .filter(
          (value, index, values) => value && values.indexOf(value) === index,
        )
        .join(", ");

      return {
        key: report._id,
        cells: {
          "report-id": (
            <Link
              to={`/accident-reports/view/${report._id}`}
              className="font-semibold text-primary hover:underline"
            >
              {report._id}
            </Link>
          ),
          "accident-type": report.accidentType
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase()),
          location,
          "date-time": (
            <>
              <span className="block">
                {reportedAt.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="block">
                {reportedAt.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </>
          ),
        },
      };
    });

  return (
    <section className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="m-0 text-title font-bold tracking-tight text-text">
              Dashboard
            </h1>
            <p className="mt-1 mb-0 text-small text-text-muted">
              Overview of reports, users, SOS alerts and listed hospitals.
            </p>
          </div>

          <DateRangePicker />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatisticCard
            id="total-reports"
            label="Total Reports"
            value={totalAccidentReports}
            icon={FileText}
            tone="primary"
          />
          <StatisticCard
            id="registered-users"
            label="Registered Users"
            value={5842}
            icon={Users}
            tone="accent"
          />
          <StatisticCard
            id="sos-alerts"
            label="SOS Alerts"
            value={210}
            icon={Siren}
            tone="accent"
          />
          <StatisticCard
            id="hospitals-listed"
            label="Hospitals Listed"
            value={128}
            icon={Hospital}
            tone="primary"
          />
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(22rem,1fr)]">
          <AccidentReportsTrend
            thirtyDaysData={trendMockData[30]}
            fortyFiveDaysData={trendMockData[45]}
            sixtyDaysData={trendMockData[60]}
          />

          <AccidentTypeDistribution
            total={totalAccidentReports}
            multiVehicleCollision={28}
            bikeAccident={20}
            hitAndRun={18}
            pedestrianAccident={12}
            truckAccident={10}
            vehicleOverturn={8}
            others={4}
          />
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <section className="min-w-0 rounded-xl border border-border-soft bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="m-0 text-body font-bold text-text">
                Recent Accident Reports
              </h2>
              <Link
                to="/accident-reports"
                className="text-tiny font-semibold text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            {areAccidentReportsLoading ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-small text-text-muted">
                <LoaderCircle size={18} className="animate-spin text-primary" />
                Loading accident reports...
              </div>
            ) : accidentReportsError ? (
              <p className="rounded-lg bg-accent-soft px-3 py-3 text-tiny font-medium text-accent">
                {accidentReportsError}
              </p>
            ) : (
              <Table
                columns={recentAccidentColumns}
                rows={recentAccidentTableRows}
              />
            )}
          </section>

          <section className="min-w-0 rounded-xl border border-border-soft bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="m-0 text-body font-bold text-text">
                Recent SOS Alerts
              </h2>
              <Link
                to="/sos-alerts"
                className="text-tiny font-semibold text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <Table columns={recentSosColumns} rows={recentSosTableRows} />
          </section>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
