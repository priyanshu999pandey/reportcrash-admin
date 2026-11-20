import {
  ArrowLeft,
  Check,
  CircleCheck,
  Clock3,
  MapPin,
  Pencil,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type {
  AccidentReportNavigationState,
  AccidentReportStatus,
} from "../../types";

const statusOptions: AccidentReportStatus[] = [
  "Under Review",
  "In Progress",
  "Resolved",
  "Rejected",
];

const AccidentReportDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reportId } = useParams<{ reportId: string }>();
  const navigationState =
    location.state as AccidentReportNavigationState | null;
  const report = navigationState?.report;
  const initialStatus = report?.status ?? "Under Review";
  const [currentStatus, setCurrentStatus] =
    useState<AccidentReportStatus>(initialStatus);
  const [draftStatus, setDraftStatus] =
    useState<AccidentReportStatus>(initialStatus);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const startStatusEdit = () => {
    setDraftStatus(currentStatus);
    setIsEditingStatus(true);
  };

  const saveStatus = () => {
    setCurrentStatus(draftStatus);
    setIsEditingStatus(false);
  };

  if (!report || report.reportId !== reportId) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-border bg-white p-6 text-center shadow-sm">
          <h1 className="m-0 text-title font-bold text-text">
            Report not found
          </h1>
          <p className="mt-2 text-small text-text-muted">
            Accident report {reportId ?? ""} could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => navigate("/accident-reports")}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-small font-semibold text-white"
          >
            <ArrowLeft size={15} />
            Back to reports
          </button>
        </div>
      </div>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${report.location.longitude - 0.01}%2C${report.location.latitude - 0.01}%2C${report.location.longitude + 0.01}%2C${report.location.latitude + 0.01}&layer=mapnik&marker=${report.location.latitude}%2C${report.location.longitude}`;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="w-full">
        <button
          type="button"
          onClick={() => navigate("/accident-reports")}
          className="mb-4 inline-flex items-center gap-2 text-small font-semibold text-text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to Accident Reports
        </button>

        <div className="rounded-xl border border-border-soft bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
            <div>
              <h1 className="m-0 text-title font-bold tracking-tight text-text">
                Accident Report Details
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <p className="m-0 text-body font-bold text-text">
                  {report.reportId}
                </p>
                <span
                  className={`rounded-md px-2 py-1 text-tiny font-semibold ${
                    currentStatus === "Under Review"
                      ? "bg-chart-amber-soft text-chart-amber-dark"
                      : currentStatus === "Resolved"
                        ? "bg-chart-green-soft text-chart-green-dark"
                        : currentStatus === "In Progress"
                          ? "bg-primary-soft text-primary"
                          : "bg-accent-soft text-accent"
                  }`}
                >
                  {currentStatus}
                </span>
              </div>
              <p className="mt-1 mb-0 text-tiny text-text-muted">
                Submitted on {report.date}, {report.time}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isEditingStatus ? (
                <>
                  <select
                    value={draftStatus}
                    onChange={(event) =>
                      setDraftStatus(event.target.value as AccidentReportStatus)
                    }
                    className="h-8 rounded-md border border-border bg-white px-2 text-tiny text-text outline-none focus:border-primary"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    title="Save status"
                    onClick={saveStatus}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    title="Cancel editing"
                    onClick={() => setIsEditingStatus(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-muted"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={startStatusEdit}
                  className="inline-flex h-8 items-center gap-2 rounded-full bg-primary px-3 text-tiny font-semibold text-white"
                >
                  <Pencil size={14} />
                  Edit status
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.75fr)]">
            <div className="space-y-5">
              <div>
                <h2 className="mb-3 text-body font-bold text-text">
                  Accident Information
                </h2>
                <dl className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-tiny text-text-muted">Accident Type</dt>
                    <dd className="mt-1 mb-0 text-small font-semibold text-text">
                      {report.accidentType}
                    </dd>
                  </div>
                  <div>
                    <div className="text-tiny text-text-muted">
                      Date &amp; Time
                    </div>
                    <div className="mt-1 mb-0 text-small font-semibold text-text">
                      {report.date}, {report.time}
                    </div>
                  </div>
                  <div>
                    <dt className="text-tiny text-text-muted">
                      Injury Condition
                    </dt>
                    <dd className="mt-2 mb-0">
                      <span
                        className={`rounded-md px-2 py-1 text-tiny font-semibold ${
                          report.injury === "Critical"
                            ? "bg-accent-soft text-accent"
                            : report.injury === "Severe"
                              ? "bg-chart-amber-soft text-text"
                              : "bg-chart-green-soft text-text"
                        }`}
                      >
                        {report.injury}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-tiny text-text-muted">
                      Current Status
                    </dt>
                    <dd className="mt-2 mb-0">
                      <span
                        className={`rounded-md px-2 py-1 text-tiny font-semibold ${
                          currentStatus === "Under Review"
                            ? "bg-chart-amber-soft text-chart-amber-dark"
                            : currentStatus === "Resolved"
                              ? "bg-chart-green-soft text-chart-green-dark"
                              : currentStatus === "In Progress"
                                ? "bg-primary-soft text-primary"
                                : "bg-accent-soft text-accent"
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-tiny text-text-muted">Description</dt>
                    <dd className="mt-1 mb-0 text-small leading-5 text-text">
                      {report.description}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="mb-3 text-body font-bold text-text">
                  Submitted Media
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {report.media.images.map((media) => (
                      <div
                        key={media.id}
                        className="overflow-hidden rounded-lg border border-border"
                      >
                        <img
                          src={media.url}
                          alt={media.title}
                          className="h-40 w-full object-cover"
                        />
                        <p className="m-0 px-3 py-2 text-tiny font-medium text-text">
                          {media.title}
                        </p>
                      </div>
                  ))}
                </div>

                <div className="mt-3 space-y-2">
                  <div className="rounded-lg border border-border p-3">
                    <p className="mt-0 mb-2 text-tiny font-medium text-text">
                      {report.media.audio.title}
                    </p>
                    <audio
                      controls
                      src={report.media.audio.url}
                      className="h-10 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <h2 className="mb-3 text-body font-bold text-text">
                  Reporter Information
                </h2>
                <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <UserRound size={22} />
                  </span>
                  <div>
                    <p className="m-0 text-small font-semibold text-text">
                      {report.user}
                    </p>
                    <p className="mt-1 mb-0 text-tiny text-text-muted">
                      {report.phone}
                    </p>
                    <span className="mt-1 inline-flex rounded bg-chart-green-soft px-1.5 py-0.5 text-tiny font-semibold text-text">
                      Registered User
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="m-0 text-body font-bold text-text">
                      Location
                    </h2>
                    <p className="mt-1 mb-0 text-tiny text-text-muted">
                      {report.location.address}
                    </p>
                  </div>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${report.location.latitude}&mlon=${report.location.longitude}#map=16/${report.location.latitude}/${report.location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-tiny font-semibold text-primary"
                  >
                    View on Map
                  </a>
                </div>
                <iframe
                  title="Accident location map"
                  src={mapUrl}
                  loading="lazy"
                  className="h-44 w-full rounded-lg border border-border"
                />
                <div className="mt-2 flex items-center gap-2 text-tiny text-text-muted">
                  <MapPin size={14} className="text-accent" />
                  <span>
                    {report.location.latitude}, {report.location.longitude}
                  </span>
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-body font-bold text-text">
                  Report History
                </h2>
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex gap-3">
                    <CircleCheck
                      size={17}
                      className="shrink-0 text-chart-green"
                    />
                    <div>
                      <p className="m-0 text-tiny font-semibold text-text">
                        Report submitted
                      </p>
                      <p className="mt-1 mb-0 text-tiny text-text-muted">
                        {report.date}, {report.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Clock3 size={17} className="shrink-0 text-chart-amber" />
                    <div>
                      <p className="m-0 text-tiny font-semibold text-text">
                        Status updated
                      </p>
                      <p className="mt-1 mb-0 text-tiny text-text-muted">
                        Current status: {currentStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccidentReportDetails;
