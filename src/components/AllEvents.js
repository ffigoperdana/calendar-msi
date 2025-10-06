import React, { useEffect, useState, useContext, useMemo } from "react";
import { gapi } from "gapi-script";
import { AuthContext } from "../context/AuthProvider";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  // eslint-disable-next-line
  Typography,
  // eslint-disable-next-line
  IconButton,
} from "@mui/material";
import { styled } from '@mui/system';
import {
  TablePagination,
  tablePaginationClasses as classes,
} from '@mui/base/TablePagination';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import '../css/Pagination.css';

const blue = {
  200: '#A5D8FF',
  400: '#3399FF',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const CustomTablePagination = styled(TablePagination)(
  ({ theme }) => `
  & .${classes.spacer} {
    display: none;
  }

  & .${classes.toolbar}  {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    background-color: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
    }
  }

  & .${classes.selectLabel} {
    margin: 0;
  }

  & .${classes.select}{
    font-family: 'IBM Plex Sans', sans-serif;
    padding: 2px 0 2px 4px;
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
    border-radius: 6px; 
    background-color: transparent;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    transition: all 100ms ease;

    &:hover {
      background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
      border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
    }

    &:focus {
      outline: 3px solid ${theme.palette.mode === 'dark' ? blue[400] : blue[200]};
      border-color: ${blue[400]};
    }
  }

  & .${classes.displayedRows} {
    margin: 0;

    @media (min-width: 768px) {
      margin-left: auto;
    }
  }

  & .${classes.actions} {
    display: flex;
    gap: 6px;
    border: transparent;
    text-align: center;
  }

  & .${classes.actions} > button {
    display: flex;
    align-items: center;
    padding: 0;
    border: transparent;
    border-radius: 50%; 
    background-color: transparent;
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    transition: all 100ms ease;

    > svg {
      font-size: 22px;
    }

    &:hover {
      background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
      border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
    }

    &:focus {
      outline: 3px solid ${theme.palette.mode === 'dark' ? blue[400] : blue[200]};
      border-color: ${blue[400]};
    }

    &:disabled {
      opacity: 0.3;
      &:hover {
        border: 1px solid ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
        background-color: transparent;
      }
    }
  }
  `,
);

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

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredEvents.length - page * rowsPerPage);

  return (
    <div className="container mt-5">
      <h2 className="my-4">All Events</h2>
      <Box sx={{ mb: 2 }}>
        <input
          type="text"
          className="form-control"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search for events"
        />
      </Box>
      <CustomTablePagination
        rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
        colSpan={3}
        count={filteredEvents.length}
        rowsPerPage={rowsPerPage}
        page={page}
        slotProps={{
          select: {
            'aria-label': 'Rows per page',
          },
          actions: {
            showFirstButton: true,
            showLastButton: true,
            slots: {
              firstPageIcon: FirstPageRoundedIcon,
              lastPageIcon: LastPageRoundedIcon,
              nextPageIcon: ChevronRightRoundedIcon,
              backPageIcon: ChevronLeftRoundedIcon,
            },
          },
        }}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
      <div className="mt-3"></div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell key={column.accessor}>{column.Header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(event => (
              <TableRow key={event.id}>
                {columns.map(column => (
                  <TableCell key={column.accessor}>{event[column.accessor]}</TableCell>
                ))}
              </TableRow>
            ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="mt-5"></div>
    </div>
  );
};

export default AllEvents;
