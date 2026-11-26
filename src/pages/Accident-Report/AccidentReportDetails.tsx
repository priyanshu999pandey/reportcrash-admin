import axios from 'axios'
import {
  ArrowLeft,
  CalendarClock,
  ExternalLink,
  Images,
  LoaderCircle,
  Mail,
  MapPin,
  Mic,
  Phone,
  UserRound,
  UsersRound,
  Video,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/baseComponents/Button'
import ApiImage from '../../components/baseComponents/ApiImage'
import { apiUrls } from '../../config/api'
import {
  setAccidentReportDetailError,
  setAccidentReportDetailLoading,
  setAccidentReports,
  setSelectedAccidentReport,
} from '../../store/accidentReportSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import type {
  AccidentReportApiResponse,
  AccidentReportsApiResponse,
} from '../../types'

const formatText = (value: string) =>
  value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const isWebUrl = (value: string) => /^https?:\/\//i.test(value)

const AccidentReportDetails = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { reportId } = useParams<{ reportId: string }>()
  const {
    items,
    selectedReport,
    isDetailLoading,
    detailError,
  } = useAppSelector((state) => state.accidentReports)
  const report =
    selectedReport?._id === reportId
      ? selectedReport
      : (items.find((item) => item._id === reportId) ?? null)
  const isLoading = isDetailLoading || (!report && !detailError && Boolean(reportId))
  const error = reportId
    ? detailError
    : 'Accident report ID is missing.'
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    if (!reportId) return

    const controller = new AbortController()

    const loadReport = async () => {
      dispatch(setAccidentReportDetailLoading(true))
      dispatch(setAccidentReportDetailError(''))

      const loadReportFromList = async () => {
        const listResponse = await axios.get(apiUrls.accidentReports, {
          signal: controller.signal,
          params: { page: 1, limit: 10 },
        })
        const listResult = listResponse.data as AccidentReportsApiResponse
        const availableReports = listResult.data.filter(
          (item) => !item.isDeleted,
        )
        const matchedReport = availableReports.find(
          (item) => item._id === reportId,
        )

        dispatch(
          setAccidentReports({
            items: availableReports,
            pagination: listResult.pagination,
          }),
        )

        if (!matchedReport) return false
        dispatch(setSelectedAccidentReport(matchedReport))
        return true
      }

      try {
        const response = await axios.get(apiUrls.accidentReportById(reportId), {
          signal: controller.signal,
        })
        const result = response.data as AccidentReportApiResponse

        if (!result.success || !result.data) {
          const reportFound = await loadReportFromList()
          if (!reportFound) {
            dispatch(
              setAccidentReportDetailError(
                result.message || 'Unable to load accident report.',
              ),
            )
          }
          return
        }

        dispatch(setSelectedAccidentReport(result.data))
      } catch (requestError: unknown) {
        if (axios.isCancel(requestError)) return

        try {
          const reportFound = await loadReportFromList()
          if (reportFound) return
        } catch (fallbackError: unknown) {
          if (axios.isCancel(fallbackError)) return
        }

        dispatch(
          setAccidentReportDetailError(
            axios.isAxiosError(requestError)
              ? (requestError.response?.data?.message ?? requestError.message)
              : 'Unable to load accident report.',
          ),
        )
      } finally {
        if (!controller.signal.aborted) {
          dispatch(setAccidentReportDetailLoading(false))
        }
      }
    }

    void loadReport()
    return () => controller.abort()
  }, [dispatch, reportId, requestKey])

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center gap-2 bg-primary-page text-small text-text-muted">
        <LoaderCircle size={18} className="animate-spin text-primary" />
        Loading accident report details...
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-white p-6 text-center shadow-sm">
          <h1 className="m-0 text-title font-bold text-text">Report not found</h1>
          <p className="mt-2 text-small text-text-muted">{error || 'This accident report is unavailable.'}</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="outline" size="small" onClick={() => navigate('/accident-reports')} className="gap-2">
              <ArrowLeft size={15} />Back to Reports
            </Button>
            <Button variant="red" size="small" onClick={() => setRequestKey((key) => key + 1)}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  const locationText = [
    report.location.address,
    report.location.city,
    report.location.state,
  ]
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(', ')
  const hasCoordinates =
    report.location.latitude !== 0 || report.location.longitude !== 0
  const mapUrl = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${report.location.longitude - 0.01}%2C${report.location.latitude - 0.01}%2C${report.location.longitude + 0.01}%2C${report.location.latitude + 0.01}&layer=mapnik&marker=${report.location.latitude}%2C${report.location.longitude}`
    : ''

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="w-full">
        <button type="button" onClick={() => navigate('/accident-reports')} className="mb-4 inline-flex items-center gap-2 text-small font-semibold text-text-muted transition-colors hover:text-primary">
          <ArrowLeft size={16} />Back to Accident Reports
        </button>

        <div className="overflow-hidden rounded-xl border border-border-soft bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
            <div>
              <h1 className="m-0 text-title font-bold tracking-tight text-text">Accident Report Details</h1>
              <p className="mt-2 mb-0 break-all text-small font-semibold text-text">{report._id}</p>
              <p className="mt-1 mb-0 text-tiny text-text-muted">Reported on {formatDateTime(report.createdAt)}</p>
            </div>
            <span className="inline-flex w-fit rounded-md bg-chart-amber-soft px-3 py-1.5 text-tiny font-semibold text-chart-amber-dark">
              {formatText(report.status)}
            </span>
          </div>

          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)]">
            <div className="space-y-5">
              <div>
                <h2 className="mb-3 text-body font-bold text-text">Accident Information</h2>
                <div className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div><p className="m-0 text-tiny text-text-muted">Accident Type</p><p className="mt-1 mb-0 text-small font-semibold text-text">{formatText(report.accidentType)}</p></div>
                  <div><p className="m-0 text-tiny text-text-muted">Injury Severity</p><p className="mt-1 mb-0 text-small font-semibold text-text">{report.injurySeverity ? formatText(report.injurySeverity) : 'Not provided'}</p></div>
                  <div><p className="m-0 text-tiny text-text-muted">Anyone Trapped</p><p className="mt-1 mb-0 text-small font-semibold text-text">{formatText(report.anyoneTrapped)}</p></div>
                  <div><p className="m-0 text-tiny text-text-muted">Persons Involved</p><p className="mt-1 mb-0 inline-flex items-center gap-1.5 text-small font-semibold text-text"><UsersRound size={15} className="text-primary" />{report.personsInvolved ?? 'Not provided'}</p></div>
                  <div><p className="m-0 text-tiny text-text-muted">Created At</p><p className="mt-1 mb-0 inline-flex items-center gap-1.5 text-small font-semibold text-text"><CalendarClock size={15} className="text-primary" />{formatDateTime(report.createdAt)}</p></div>
                  <div><p className="m-0 text-tiny text-text-muted">Last Updated</p><p className="mt-1 mb-0 text-small font-semibold text-text">{formatDateTime(report.updatedAt)}</p></div>
                  <div className="sm:col-span-2 xl:col-span-3"><p className="m-0 text-tiny text-text-muted">Additional Information</p><p className="mt-1 mb-0 text-small leading-6 text-text">{report.additionalInformation || 'No additional information was submitted.'}</p></div>
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-body font-bold text-text">Submitted Media</h2>
                {report.photos.length === 0 && report.videos.length === 0 && !report.voiceNote ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-small text-text-muted">No media was submitted with this report.</div>
                ) : (
                  <div className="space-y-4">
                    {report.photos.length > 0 && (
                      <div>
                        <p className="mb-2 inline-flex items-center gap-2 text-small font-semibold text-text"><Images size={16} className="text-primary" />Photos</p>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {report.photos.map((photo, index) =>
                            isWebUrl(photo) ? (
                              <a key={`${photo}-${index}`} href={photo} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border border-border bg-primary-page">
                                <ApiImage src={photo} alt={`Accident evidence ${index + 1}`} className="h-40 w-full object-cover" />
                                <span className="flex items-center justify-between gap-2 px-3 py-2 text-tiny font-medium text-text">Photo {index + 1}<ExternalLink size={13} /></span>
                              </a>
                            ) : (
                              <div key={`${photo}-${index}`} className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border p-4 text-center text-tiny text-text-muted"><Images size={22} className="mb-2 text-primary" />Device-local photo cannot be opened in the admin panel.</div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {report.videos.length > 0 && (
                      <div>
                        <p className="mb-2 inline-flex items-center gap-2 text-small font-semibold text-text"><Video size={16} className="text-primary" />Videos</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {report.videos.map((video, index) =>
                            isWebUrl(video) ? (
                              <video key={`${video}-${index}`} controls src={video} className="h-48 w-full rounded-lg border border-border bg-text object-cover" />
                            ) : (
                              <div key={`${video}-${index}`} className="rounded-lg border border-dashed border-border p-4 text-center text-tiny text-text-muted">Device-local video cannot be opened in the admin panel.</div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {report.voiceNote && (
                      <div className="rounded-lg border border-border p-3">
                        <p className="mt-0 mb-2 inline-flex items-center gap-2 text-small font-semibold text-text"><Mic size={16} className="text-primary" />Voice Note</p>
                        {isWebUrl(report.voiceNote) ? <audio controls src={report.voiceNote} className="h-10 w-full" /> : <p className="m-0 text-tiny text-text-muted">Device-local voice note cannot be opened in the admin panel.</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <h2 className="mb-3 text-body font-bold text-text">Reporter Information</h2>
                <div className="rounded-lg border border-border p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><UserRound size={22} /></span>
                    <div><p className="m-0 text-small font-semibold text-text">{report.reportedBy.name}</p><p className="mt-1 mb-0 break-all text-tiny text-text-muted">ID: {report.reportedBy._id}</p></div>
                  </div>
                  <div className="space-y-3 border-t border-border pt-3">
                    <a href={`mailto:${report.reportedBy.email}`} className="flex items-center gap-2 text-tiny text-text-muted hover:text-primary"><Mail size={15} />{report.reportedBy.email}</a>
                    <a href={`tel:${report.reportedBy.phone}`} className="flex items-center gap-2 text-tiny text-text-muted hover:text-primary"><Phone size={15} />{report.reportedBy.phone}</a>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div><h2 className="m-0 text-body font-bold text-text">Location</h2><p className="mt-1 mb-0 text-tiny leading-5 text-text-muted">{locationText}</p></div>
                  {hasCoordinates && <a href={`https://www.openstreetmap.org/?mlat=${report.location.latitude}&mlon=${report.location.longitude}`} target="_blank" rel="noreferrer" className="shrink-0 text-tiny font-semibold text-primary">View Map</a>}
                </div>
                {hasCoordinates ? (
                  <iframe title="Accident location map" src={mapUrl} loading="lazy" className="h-52 w-full rounded-lg border border-border" />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border px-4 text-center text-tiny text-text-muted">Map coordinates were not provided for this report.</div>
                )}
                <div className="mt-2 flex items-center gap-2 text-tiny text-text-muted"><MapPin size={14} className="text-accent" /><span>{report.location.latitude}, {report.location.longitude}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccidentReportDetails
