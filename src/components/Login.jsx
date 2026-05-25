import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import moment from "moment";

const Login = () => {
  const { user, signInWithGoogle, sessionExpired, setNavigate } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get("expired") === "true" || sessionExpired;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");

  useEffect(() => {
    if (setNavigate) {
      setNavigate(navigate);
    }
  }, [navigate, setNavigate]);

  useEffect(() => {
    if (user) {
      navigate("/events");
    }
  }, [user, navigate]);

  // Sample events relative to current month
  const sampleEvents = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return [
      { id: 1, title: "Sprint Planning", start: new Date(year, month, 3, 9, 0), end: new Date(year, month, 3, 10, 0), color: "bg-red-100 text-red-700 border-red-200" },
      { id: 2, title: "Meeting", start: new Date(year, month, 7, 10, 0), end: new Date(year, month, 7, 11, 0), color: "bg-blue-100 text-blue-700 border-blue-200" },
      { id: 3, title: "Daily Standup", start: new Date(year, month, 10, 9, 0), end: new Date(year, month, 10, 9, 30), color: "bg-red-100 text-red-700 border-red-200" },
      { id: 4, title: "Review", start: new Date(year, month, 15, 9, 0), end: new Date(year, month, 15, 10, 0), color: "bg-green-100 text-green-700 border-green-200" },
      { id: 5, title: "Workshop", start: new Date(year, month, 22, 14, 0), end: new Date(year, month, 22, 16, 0), color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    ];
  }, [currentDate]);

  // Calendar navigation
  const goToToday = () => setCurrentDate(new Date());
  const goBack = () => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() - 1);
    else if (view === "week") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };
  const goNext = () => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() + 1);
    else if (view === "week") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  // Generate calendar grid for month view
  const generateMonthGrid = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, muted: true, date: new Date(year, month - 1, daysInPrevMonth - i) });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ day: i, muted: false, date: new Date(year, month, i) });
    }

    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, muted: true, date: new Date(year, month + 1, i) });
    }

    return cells;
  }, [currentDate]);

  // Generate week view
  const generateWeekGrid = useCallback(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const cells = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      cells.push({ day: d.getDate(), muted: d.getMonth() !== currentDate.getMonth(), date: d });
    }
    return cells;
  }, [currentDate]);

  const getEventsForDate = (date) => {
    return sampleEvents.filter(
      (e) => e.start.getFullYear() === date.getFullYear() && e.start.getMonth() === date.getMonth() && e.start.getDate() === date.getDate()
    );
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthLabel = moment(currentDate).format("MMMM YYYY");

  const monthCells = generateMonthGrid();
  const weekCells = generateWeekGrid();

  return (
    <div className="flex -mt-5 overflow-hidden bg-gray-50" style={{ height: "calc(100vh - 56px)" }}>
      {/* Left Side - Interactive Calendar (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[50%] flex-col p-4 bg-white border-r border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📅</span>
          <h3 className="text-lg font-semibold text-gray-800 m-0">Calendar</h3>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs" onClick={goToToday}>Today</Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={goBack}>Back</Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={goNext}>Next</Button>
            <span className="font-semibold text-gray-800 ml-2 text-sm">{monthLabel}</span>
          </div>
          <div className="flex border border-gray-200 rounded-md overflow-hidden">
            {["month", "week", "day"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-xs capitalize transition-colors ${
                  view === v ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {view === "month" && (
            <div className="grid grid-cols-7 h-full" style={{ gridTemplateRows: "auto repeat(6, 1fr)" }}>
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1 border-b border-gray-200 bg-gray-50">
                  {day}
                </div>
              ))}
              {monthCells.map((cell, idx) => {
                const events = getEventsForDate(cell.date);
                const today = isToday(cell.date);
                return (
                  <div
                    key={idx}
                    className={`border-b border-r border-gray-100 p-1 flex flex-col overflow-hidden ${
                      cell.muted ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50 transition-colors cursor-pointer`}
                  >
                    <span
                      className={`text-xs self-start ml-0.5 ${cell.muted ? "text-gray-300" : "text-gray-700"} ${
                        today ? "bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold" : ""
                      }`}
                    >
                      {cell.day}
                    </span>
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className={`text-[10px] mt-0.5 px-1 py-0.5 rounded border truncate ${event.color}`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {view === "week" && (
            <div className="grid grid-cols-7 h-full" style={{ gridTemplateRows: "auto 1fr" }}>
              {weekDays.map((day, i) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1 border-b border-gray-200 bg-gray-50">
                  {day} {weekCells[i]?.day}
                </div>
              ))}
              {weekCells.map((cell, idx) => {
                const events = getEventsForDate(cell.date);
                const today = isToday(cell.date);
                return (
                  <div
                    key={idx}
                    className={`border-r border-gray-100 p-2 flex flex-col ${
                      today ? "bg-blue-50" : "bg-white"
                    } hover:bg-blue-50 transition-colors cursor-pointer`}
                  >
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs mt-1 px-2 py-1 rounded border ${event.color}`}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-[10px] opacity-75">
                          {moment(event.start).format("HH:mm")} - {moment(event.end).format("HH:mm")}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {view === "day" && (
            <div className="h-full overflow-auto">
              <div className="text-center py-2 border-b border-gray-200 bg-gray-50">
                <span className="text-sm font-semibold text-gray-700">
                  {moment(currentDate).format("dddd, MMMM D, YYYY")}
                </span>
              </div>
              <div className="p-3 space-y-2">
                {getEventsForDate(currentDate).length > 0 ? (
                  getEventsForDate(currentDate).map((event) => (
                    <div key={event.id} className={`px-3 py-2 rounded border ${event.color}`}>
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs opacity-75">
                        {moment(event.start).format("HH:mm")} - {moment(event.end).format("HH:mm")}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm text-center py-8">No events for this day</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-1 items-center justify-center p-6 overflow-auto">
        <div className="w-full max-w-md text-center space-y-5">
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src="/l_MSTI Logo_Transparent.png"
              alt="Mastersystem Logo"
              className="h-16 object-contain"
            />
          </div>

          {/* Session Expired Warning */}
          {isExpired && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-red-600 font-medium m-0 text-sm">
                Session expired, please sign in again
              </p>
            </div>
          )}

          {/* Welcome Text */}
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Hi Para Mas Mbak Abang Cak, welcome back!
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              Yuk, masuk dengan akun Mastersystem dan segera kumpulkan daily sebelum disinggung mbak nia.
            </p>
          </div>

          {/* Trust Indicators */}
          <Card className="border border-gray-200 bg-white shadow-sm text-left">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-base">🔒</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 m-0">Official Google OAuth 2.0</p>
                  <p className="text-xs text-gray-500 m-0 mt-0.5">
                    This app uses Google&apos;s official authentication — your credentials are never shared.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-base">📅</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 m-0">Calendar access only</p>
                  <p className="text-xs text-gray-500 m-0 mt-0.5">
                    Only your calendar data is accessed — nothing else.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-base">🚫</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 m-0">No external storage</p>
                  <p className="text-xs text-gray-500 m-0 mt-0.5">
                    No data is stored on external servers — everything stays with Google.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-base">🛡️</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 m-0">Privacy respected</p>
                  <p className="text-xs text-gray-500 m-0 mt-0.5">
                    Your privacy is fully respected — we follow best practices.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google Sign-In Button */}
          <Button
            variant="outline"
            className="w-full h-11 text-sm font-medium border-gray-300 hover:bg-gray-100 shadow-sm"
            onClick={signInWithGoogle}
          >
            <div className="flex items-center justify-center gap-3">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              <span>Sign in with Google</span>
            </div>
          </Button>

          {/* Footer Links */}
          <div className="flex items-center justify-center gap-3 text-sm text-gray-400">
            <a href="/privacy" className="hover:text-gray-600 underline">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-gray-600 underline">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
