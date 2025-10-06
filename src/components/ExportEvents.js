import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { gapi } from "gapi-script";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import emailjs from "emailjs-com";

const ExportEvents = () => {
  const { user, token } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [cc, setCc] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [textFilter, setTextFilter] = useState("");
  const [sheetName, setSheetName] = useState("");

  useEffect(() => {
    if (user && token) {
      const fetchEvents = async () => {
        gapi.client.setToken({ access_token: token });

        try {
          const response = await gapi.client.calendar.events.list({
            calendarId: "primary",
            showDeleted: false,
            singleEvents: true,
            orderBy: "startTime",
            timeMin: new Date("2025-01-01T00:00:00Z").toISOString(),
            timeMax: new Date("2025-12-31T23:59:59Z").toISOString(),
          });

          const fetchedEvents = response.result.items.map(event => ({
            start: new Date(event.start.dateTime || event.start.date).toLocaleString(),
            end: new Date(event.end.dateTime || event.end.date).toLocaleString(),
            description: event.summary,
            duration: event.end.dateTime && event.start.dateTime ? ((new Date(event.end.dateTime) - new Date(event.start.dateTime)) / 3600000).toFixed(2) : "",
            notes: event.description
          }));

          setEvents(fetchedEvents);
          console.log("Fetched events:", fetchedEvents); // Log fetched events
        } catch (error) {
          console.error("Error fetching events: ", error);
        }
      };

      fetchEvents();
    }
  }, [user, token]);

  const filterEvents = () => {
    let filteredEvents = events;

    if (startDate) {
      filteredEvents = filteredEvents.filter(event => new Date(event.start) >= startDate);
    }

    if (endDate) {
      filteredEvents = filteredEvents.filter(event => new Date(event.end) <= endDate);
    }

    if (textFilter) {
      filteredEvents = filteredEvents.filter(event =>
        event.description.includes(textFilter) || (event.notes && event.notes.includes(textFilter))
      );
    }

    return filteredEvents;
  };

  const calculateSumDuration = (events) => {
    return events.reduce((total, event) => total + parseFloat(event.duration || 0), 0);
  };

  const exportToExcel = () => {
    const filteredEvents = filterEvents();
    const sumDuration = calculateSumDuration(filteredEvents);

    const ws = XLSX.utils.json_to_sheet(filteredEvents, {
      header: ["start", "end", "description", "duration", "notes"]
    });

    // Add header information
    XLSX.utils.sheet_add_aoa(ws, [
      ["FILTERED PERIOD:", `FROM ${startDate ? startDate.toLocaleDateString() : ''} TO ${endDate ? endDate.toLocaleDateString() : ''}`, '', '', ''],
      ["FILTERED TEXT:", textFilter, '', '', ''],
      ["CALENDAR", user.email, '', '', ''],
      ["SUM DURATION", sumDuration, '', '', ''],
      ['', '', '', '', ''],
      ["START", "END", "DESCRIPTION", "DURATION", "NOTES"]
    ], { origin: "A1" });

    XLSX.utils.sheet_add_json(ws, filteredEvents, { skipHeader: true, origin: "A7" });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName || "Events");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    return new Blob([excelBuffer], { type: "application/octet-stream" });
  };

  const downloadExcel = () => {
    const blob = exportToExcel();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sheetName || "events"}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    const blob = exportToExcel();

    const reader = new FileReader();
    reader.onload = async function (e) {
      const base64data = e.target.result.split(",")[1];

      const templateParams = {
        to_email: recipient,
        cc_email: cc,
        subject: "Exported Events",
        message: "Here are the exported events.",
        attachment: base64data,
        attachment_name: `${sheetName || 'events'}.xlsx`
      };

      try {
        await emailjs.send(
          "YOUR_SERVICE_ID", // Replace with your EmailJS service ID
          "YOUR_TEMPLATE_ID", // Replace with your EmailJS template ID
          templateParams,
          "YOUR_USER_ID" // Replace with your EmailJS user ID
        );
        alert("Email sent successfully");
      } catch (error) {
        console.error("Error sending email: ", error);
        alert(`Error sending email: ${error.message}`);
      }
    };
    reader.readAsDataURL(blob);
  };

  return (
    <div className="container">
      <h2 className="my-4">Export Events</h2>
      <form onSubmit={sendEmail}>
        <div className="form-group mt-3">
          <label>Sheet Name to create (optional):</label>
          <input
            type="text"
            className="form-control"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="Sheet Name"
          />
        </div>
        <div className="form-group mt-3">
          <label>Text to search (optional):</label>
          <input
            type="text"
            className="form-control"
            value={textFilter}
            onChange={(e) => setTextFilter(e.target.value)}
            placeholder="text1,text2,..."
          />
        </div>
        <div className="form-group mt-3">
          <label>Event range:</label>
          <div className="d-flex">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Start Date"
              dateFormat="dd/MM/yyyy"
              className="form-control"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              placeholderText="End Date"
              dateFormat="dd/MM/yyyy"
              className="form-control ml-2"
            />
          </div>
        </div>
        <div className="form-group mt-3">
          <label>Recipient Email:</label>
          <input
            type="email"
            className="form-control"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient Email"
            required
          />
        </div>
        <div className="form-group mt-3">
          <label>CC Email:</label>
          <input
            type="email"
            className="form-control"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="CC Email"
          />
        </div>
        <div className="d-grid gap-2 mt-3">
          <button type="button" className="btn btn-primary mt-3" onClick={downloadExcel}>Download Excel</button>
          <button type="submit" className="btn btn-secondary mr-3 mt-1 mb-4">Send Email</button>
        </div>
      </form>
    </div>
  );
};

export default ExportEvents;
