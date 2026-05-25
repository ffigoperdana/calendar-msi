import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { gapi } from "gapi-script";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/**
 * Constructs a valid multipart MIME message with a base64-encoded Excel attachment.
 * @param {string} to - Recipient email address
 * @param {string} cc - CC email address (optional)
 * @param {string} subject - Email subject
 * @param {string} body - Email body text
 * @param {Blob} attachmentBlob - The Excel file as a Blob
 * @param {string} filename - The attachment filename
 * @returns {Promise<string>} - The base64url-encoded MIME message
 */
export function buildMimeMessage(to, cc, subject, body, attachmentBlob, filename) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64Data = e.target.result.split(",")[1];
      const boundary = "boundary_" + Date.now().toString(36);

      let mimeMessage = "";
      mimeMessage += `To: ${to}\r\n`;
      if (cc) {
        mimeMessage += `Cc: ${cc}\r\n`;
      }
      mimeMessage += `Subject: ${subject}\r\n`;
      mimeMessage += "MIME-Version: 1.0\r\n";
      mimeMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n`;
      mimeMessage += "\r\n";

      // Body part
      mimeMessage += `--${boundary}\r\n`;
      mimeMessage += "Content-Type: text/plain; charset=\"UTF-8\"\r\n";
      mimeMessage += "\r\n";
      mimeMessage += `${body}\r\n`;
      mimeMessage += "\r\n";

      // Attachment part
      mimeMessage += `--${boundary}\r\n`;
      mimeMessage += `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; name="${filename}"\r\n`;
      mimeMessage += "Content-Transfer-Encoding: base64\r\n";
      mimeMessage += `Content-Disposition: attachment; filename="${filename}"\r\n`;
      mimeMessage += "\r\n";
      mimeMessage += `${base64Data}\r\n`;
      mimeMessage += `--${boundary}--\r\n`;

      // Encode to base64url (RFC 4648 §5)
      const encodedMessage = btoa(unescape(encodeURIComponent(mimeMessage)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      resolve(encodedMessage);
    };
    reader.onerror = function () {
      reject(new Error("Failed to read attachment blob"));
    };
    reader.readAsDataURL(attachmentBlob);
  });
}

const ExportEvents = () => {
  const { user, token, authenticatedRequest } = useContext(AuthContext);
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
          console.log("Fetched events:", fetchedEvents);
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

    // Step 1: Create worksheet with header metadata rows (rows 1-6) using aoa_to_sheet
    const headerRows = [
      ["FILTERED PERIOD:", `FROM ${startDate ? startDate.toLocaleDateString() : ''} TO ${endDate ? endDate.toLocaleDateString() : ''}`, '', '', ''],
      ["FILTERED TEXT:", textFilter, '', '', ''],
      ["CALENDAR", user.email, '', '', ''],
      ["SUM DURATION", sumDuration, '', '', ''],
      ['', '', '', '', ''],
      ["START", "END", "DESCRIPTION", "DURATION", "NOTES"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(headerRows);

    // Step 2: Append event data below headers at row 7
    XLSX.utils.sheet_add_json(ws, filteredEvents, { skipHeader: true, origin: "A7" });

    // Step 3: Bold header row (row 6 - the column headers)
    const headerCols = ["A6", "B6", "C6", "D6", "E6"];
    headerCols.forEach(cellRef => {
      if (ws[cellRef]) {
        ws[cellRef].s = {
          ...(ws[cellRef].s || {}),
          font: { bold: true }
        };
      }
    });

    // Step 4: Add borders to data cells (row 7 onwards)
    const borderStyle = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" }
    };

    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let row = 6; row <= range.e.r; row++) { // row index 6 = row 7 (0-based)
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        if (ws[cellRef]) {
          ws[cellRef].s = {
            ...(ws[cellRef].s || {}),
            border: borderStyle
          };
        }
      }
    }

    // Step 5: Auto-size columns based on max content width
    const colWidths = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      let maxWidth = 10; // minimum width
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        if (ws[cellRef] && ws[cellRef].v != null) {
          const cellValue = String(ws[cellRef].v);
          maxWidth = Math.max(maxWidth, cellValue.length + 2);
        }
      }
      colWidths.push({ wch: maxWidth });
    }
    ws['!cols'] = colWidths;

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
    const filename = `${sheetName || 'events'}.xlsx`;

    try {
      const raw = await buildMimeMessage(
        recipient,
        cc,
        "Exported Events",
        "Here are the exported events.",
        blob,
        filename
      );

      await authenticatedRequest({
        path: "/gmail/v1/users/me/messages/send",
        method: "POST",
        body: { raw },
      });

      alert("Email sent successfully");
    } catch (error) {
      console.error("Error sending email: ", error);
      const errorMessage = error?.result?.error?.message || error?.message || "Unknown error occurred";
      alert(`Error sending email: ${errorMessage}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4">
      <h2 className="my-4 text-2xl font-semibold">Export Events</h2>
      <form onSubmit={sendEmail} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sheetName">Sheet Name to create (optional):</Label>
          <Input
            id="sheetName"
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="Sheet Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="textFilter">Text to search (optional):</Label>
          <Input
            id="textFilter"
            type="text"
            value={textFilter}
            onChange={(e) => setTextFilter(e.target.value)}
            placeholder="text1,text2,..."
          />
        </div>
        <div className="space-y-2">
          <Label>Event range:</Label>
          <div className="flex gap-2">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Start Date"
              dateFormat="dd/MM/yyyy"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              placeholderText="End Date"
              dateFormat="dd/MM/yyyy"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Email:</Label>
          <Input
            id="recipient"
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient Email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cc">CC Email:</Label>
          <Input
            id="cc"
            type="email"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="CC Email"
          />
        </div>
        <div className="grid gap-2 pt-2 pb-4">
          <Button type="button" onClick={downloadExcel}>
            Download Excel
          </Button>
          <Button type="submit" variant="secondary">
            Send Email
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExportEvents;
