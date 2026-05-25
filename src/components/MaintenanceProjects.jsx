import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const MaintenanceProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
      const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;
      const RANGE = 'Sheet1!A2:G';
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Respons jaringan tidak baik');
        }
        const data = await response.json();
        const formattedData = data.values.map(row => ({
          start: row[0],
          end: row[1],
          status: row[2],
          kodeProject: row[3],
          tipeMaintenance: row[4],
          namaProject: row[5],
          linkWrike: row[6]
        }));
        setProjects(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Error saat mengambil data proyek:', error);
        setError('Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          className="animate-spin h-10 w-10 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-destructive text-lg font-semibold">
        {error}
      </p>
    );
  }

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">
        Proyek Pemeliharaan
      </h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mulai</TableHead>
              <TableHead>Selesai</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Kode Proyek</TableHead>
              <TableHead>Tipe Pemeliharaan</TableHead>
              <TableHead>Nama Proyek</TableHead>
              <TableHead>Link Wrike</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project, index) => (
              <TableRow key={index}>
                <TableCell>{project.start}</TableCell>
                <TableCell>{project.end}</TableCell>
                <TableCell>{project.status}</TableCell>
                <TableCell>{project.kodeProject}</TableCell>
                <TableCell>{project.tipeMaintenance}</TableCell>
                <TableCell>{project.namaProject}</TableCell>
                <TableCell>
                  <a
                    href={project.linkWrike}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80"
                  >
                    {project.linkWrike}
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MaintenanceProjects;
