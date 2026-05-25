import React, { useEffect, useState, useContext, useMemo } from "react";
import { gapi } from "gapi-script";
import { AuthContext } from "../context/AuthProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AllEvents = () => {
  const { user, token } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
            timeMin: new Date('2025-01-01T00:00:00Z').toISOString(),
            timeMax: new Date('2025-12-31T23:59:59Z').toISOString()
          });

          const fetchedEvents = response.result.items.map(event => ({
            id: event.id,
            summary: event.summary,
            description: event.description,
            start: new Date(event.start.dateTime || event.start.date).toLocaleString(),
            end: new Date(event.end.dateTime || event.end.date).toLocaleString()
          }));

          setEvents(fetchedEvents);
        } catch (error) {
          console.error("Error fetching events: ", error);
        }
      };

      fetchEvents();
    }
  }, [user, token]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event =>
      (event.summary && event.summary.toLowerCase().includes(search.toLowerCase())) ||
      (event.description && event.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [events, search]);

  const columns = useMemo(
    () => [
      { Header: "Summary", accessor: "summary" },
      { Header: "Description", accessor: "description" },
      { Header: "Start", accessor: "start" },
      { Header: "End", accessor: "end" },
    ],
    []
  );

  const totalPages = rowsPerPage === -1
    ? 1
    : Math.ceil(filteredEvents.length / rowsPerPage);

  const displayedEvents = rowsPerPage === -1
    ? filteredEvents
    : filteredEvents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleFirstPage = () => setPage(0);
  const handlePrevPage = () => setPage((prev) => Math.max(0, prev - 1));
  const handleNextPage = () => setPage((prev) => Math.min(totalPages - 1, prev + 1));
  const handleLastPage = () => setPage(totalPages - 1);

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number(value));
    setPage(0);
  };

  const startRow = filteredEvents.length === 0 ? 0 : page * (rowsPerPage === -1 ? filteredEvents.length : rowsPerPage) + 1;
  const endRow = rowsPerPage === -1
    ? filteredEvents.length
    : Math.min((page + 1) * rowsPerPage, filteredEvents.length);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">All Events</h2>

      <div className="mb-4">
        <Input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search for events"
        />
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={handleRowsPerPageChange}
          >
            <SelectTrigger className="w-[80px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="-1">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm text-muted-foreground sm:ml-auto">
          {startRow}–{endRow} of {filteredEvents.length}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleFirstPage}
            disabled={page === 0}
            aria-label="First page"
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevPage}
            disabled={page === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextPage}
            disabled={page >= totalPages - 1}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleLastPage}
            disabled={page >= totalPages - 1}
            aria-label="Last page"
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead key={column.accessor}>{column.Header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedEvents.length > 0 ? (
              displayedEvents.map(event => (
                <TableRow key={event.id}>
                  {columns.map(column => (
                    <TableCell key={column.accessor}>{event[column.accessor]}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No events found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AllEvents;
