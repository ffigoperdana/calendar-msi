import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { gapi } from "gapi-script";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Events = () => {
  const { user, token } = useContext(AuthContext);
  const [workingType, setWorkingType] = useState("");
  const [division, setDivision] = useState("");
  const [whatToDo, setWhatToDo] = useState("");
  const [userType, setUserType] = useState("");
  const [caseSituation, setCaseSituation] = useState("");
  const [caseId, setCaseId] = useState("");
  const [situationRole, setSituationRole] = useState("");
  const [riskProblem, setRiskProblem] = useState("");
  const [devices, setDevices] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [problemAnalysis, setProblemAnalysis] = useState("");
  const [request, setRequest] = useState("");
  const [userRequest, setUserRequest] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  // eslint-disable-next-line
  const [generatedTitle, setGeneratedTitle] = useState("");
  // eslint-disable-next-line
  const [generatedDetail, setGeneratedDetail] = useState("");
  const [editableTitle, setEditableTitle] = useState("");
  const [editableDetail, setEditableDetail] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  // Updated divisionMap with added "code" for each division
  const divisionMap = {
    DC: {
      name: "BCA-2025-DC MBCA",
      link: "https://www.wrike.com/open.htm?id=1278006298",
      code: "[TB002724D0049]",
    },
    DRC: {
      name: "BCA-2025-DRC Grha Asia Sby",
      link: "https://www.wrike.com/open.htm?id=1184331369",
      code: "[TB002724D0059]",
    },
    KP: {
      name: "BCA-2025-KP Extention",
      link: "https://www.wrike.com/open.htm?id=1184331441",
      code: "[TB002724D0039]",
    },
    BRANCH: {
      name: "Maintenance Cabang BCA 2025",
      link: "https://www.wrike.com/open.htm?id=1030475273",
      code: "[TB002724D0069]",
    },
    PEMREK: {
      name: "Maintenance Perangkat REM 2025",
      link: "https://www.wrike.com/open.htm?id=1060642290",
      code: "[TB002724D0029]",
    },
    IPTEL: {
      name: "Maintenance IPTEL BCA 2025",
      link: "https://www.wrike.com/open.htm?id=1257841515",
      code: "[TB002724D0099]",
    },
    CISCO: {
      name: "Renewal Maintenance Cisco 2025",
      link: "https://www.wrike.com/open.htm?id=1135457903",
      code: "[TB002724D0009]",
    },
    ATM: {
      name: "Renewal CP ATM E2E",
      link: "https://www.wrike.com/open.htm?id=1229068051",
      code: "[TB002724D003F9]",
    },
    NGIPS: {
      name: "Cisco IPS Fase 3 (block IB  TP  PI & BCAF)",
      link: "https://www.wrike.com/open.htm?id=1202939420",
      code: "[TB002724D00S69]",
    },
    ISE: {
      name: "Maintenance Network WPI",
      link: "https://www.wrike.com/open.htm?id=1060641749",
      code: "[TB002724D006D9]",
    },
  };

  // Optional: If your select options don't match the keys exactly,
  // you can map them here. For example, if "KP Ext" is chosen, map to "KP":
  const getDivisionKey = (selected) => {
    switch (selected) {
      case "KP Ext":
        return "KP";
      case "CISCO BCAD":
        return "CISCO";
      case "ATM Checkpoint":
        return "ATM";
      case "ISE BCAF":
        return "ISE";
      default:
        return selected;
    }
  };

  const handleCheck = () => {
    let titlePrefix = workingType === "Implement" ? "[I]" : "[N]";
    // Use the helper function to map the division value if needed
    const divisionKey = getDivisionKey(division);
    let divisionData = divisionMap[divisionKey];
    if (!divisionData) {
      alert("Selected division is not valid in the mapping.");
      return;
    }
    let divisionText = divisionData.name;
    let divisionCode = divisionData.code;
    let linkWrike = divisionData.link;
    let engineerName = user.displayName;

    // Updated title string with the division code inserted
    let title = `${titlePrefix} ${divisionCode} ${divisionText} ; ${whatToDo}`;
    let detail = `[${workingType}] ${userType} ; ${divisionText} ; ${whatToDo} | ${caseSituation} ; ${caseId} ; ${situationRole} ; ${riskProblem} ; ${devices} ; ${location} ; ${description} ; ${problemAnalysis} ; ${request} ; ${userRequest} ; ${engineerName} ; ${linkWrike}`;
    
    setGeneratedTitle(title);
    setGeneratedDetail(detail);
    setEditableTitle(title);
    setEditableDetail(detail);
    setIsChecked(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isChecked) {
      alert("Please check the generated title and detail before submitting.");
      return;
    }

    if (user && token) {
      const event = {
        summary: editableTitle,
        description: editableDetail,
        start: {
          dateTime: new Date(`${date}T${startTime}`).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(`${date}T${endTime}`).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: [
          { email: user.email }  // Add the logged-in user's email as a guest
        ],
      };

      gapi.client.setToken({ access_token: token });

      try {
        await gapi.client.request({
          path: '/calendar/v3/calendars/primary/events',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(event),
        });
        alert("Event created successfully");
        // Reset form fields if needed
        setGeneratedTitle("");
        setGeneratedDetail("");
        setEditableTitle("");
        setEditableDetail("");
        setIsChecked(false);
      } catch (error) {
        console.error("Error creating event: ", error);
        alert(`Error creating event: ${error.result.error.message}`);
      }
    } else {
      alert("You must be logged in to create an event");
    }
  };

  const selectClassName = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h2 className="text-2xl font-bold mb-6">Create Event</h2>
      <form onSubmit={handleSubmit}>
        {/* Main grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Section 1: Work Info */}
          <div className="space-y-2">
            <Label htmlFor="workingType">Working Type</Label>
            <select id="workingType" className={selectClassName} value={workingType} onChange={(e) => setWorkingType(e.target.value)} required>
              <option value="">Select Working Type</option>
              <option value="Implement">Implement</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="division">Division</Label>
            <select id="division" className={selectClassName} value={division} onChange={(e) => setDivision(e.target.value)} required>
              <option value="">Select Division</option>
              <option value="DC">DC</option>
              <option value="DRC">DRC</option>
              <option value="KP Ext">KP Ext</option>
              <option value="BRANCH">BRANCH</option>
              <option value="PEMREK">PEMREK</option>
              <option value="IPTEL">IPTEL</option>
              <option value="CISCO BCAD">CISCO BCAD</option>
              <option value="ATM Checkpoint">ATM Checkpoint</option>
              <option value="NGIPS">NGIPS</option>
              <option value="ISE BCAF">ISE BCAF</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatToDo">What To Do</Label>
            <Input id="whatToDo" type="text" value={whatToDo} onChange={(e) => setWhatToDo(e.target.value)} required />
          </div>

          {/* Section 2: User/Case */}
          <div className="space-y-2">
            <Label htmlFor="userType">User</Label>
            <select id="userType" className={selectClassName} value={userType} onChange={(e) => setUserType(e.target.value)} required>
              <option value="">Select User</option>
              <option value="BCA">BCA</option>
              <option value="BCAF">BCAF</option>
              <option value="BCAD">BCAD</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caseSituation">Case Situation</Label>
            <select id="caseSituation" className={selectClassName} value={caseSituation} onChange={(e) => setCaseSituation(e.target.value)} required>
              <option value="">Select Case Situation</option>
              <option value="On Progress">On Progress</option>
              <option value="Temporary Solution">Temporary Solution</option>
              <option value="Solved">Solved</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caseId">Case ID</Label>
            <Input id="caseId" type="text" value={caseId} onChange={(e) => setCaseId(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="situationRole">Situation Role</Label>
            <select id="situationRole" className={selectClassName} value={situationRole} onChange={(e) => setSituationRole(e.target.value)} required>
              <option value="">Select Situation Role</option>
              <option value="Problem">Problem</option>
              <option value="Support">Support</option>
              <option value="Change">Change</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="riskProblem">Risk Problem</Label>
            <select id="riskProblem" className={selectClassName} value={riskProblem} onChange={(e) => setRiskProblem(e.target.value)} required>
              <option value="">Select Risk Problem</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>

          {/* Section 3: Details */}
          <div className="space-y-2">
            <Label htmlFor="devices">Devices</Label>
            <Input id="devices" type="text" value={devices} onChange={(e) => setDevices(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemAnalysis">Problem Analysis</Label>
            <Input id="problemAnalysis" type="text" value={problemAnalysis} onChange={(e) => setProblemAnalysis(e.target.value)} required />
          </div>

          {/* Section 4: Request */}
          <div className="space-y-2">
            <Label htmlFor="request">Request</Label>
            <Input id="request" type="text" value={request} onChange={(e) => setRequest(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userRequest">User Request</Label>
            <Input id="userRequest" type="text" value={userRequest} onChange={(e) => setUserRequest(e.target.value)} required />
          </div>

          {/* Section 5: Schedule - full-width row */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>
        </div>

        {/* Check button - full width below grid */}
        <div className="mt-6">
          <Button type="button" className="w-full" onClick={handleCheck}>Check</Button>
        </div>

        {/* Generated Title - full width */}
        <div className="space-y-2 mt-4">
          <Label htmlFor="editableTitle">Generated Title</Label>
          <textarea
            id="editableTitle"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={editableTitle}
            onChange={(e) => setEditableTitle(e.target.value)}
          />
        </div>

        {/* Generated Detail - full width */}
        <div className="space-y-2 mt-4">
          <Label htmlFor="editableDetail">Generated Detail</Label>
          <textarea
            id="editableDetail"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={editableDetail}
            onChange={(e) => setEditableDetail(e.target.value)}
          />
        </div>

        {/* Submit button - full width */}
        <div className="mt-6">
          <Button type="submit" variant="default" className="w-full bg-green-600 hover:bg-green-700" disabled={!isChecked}>Submit</Button>
        </div>
      </form>
    </div>
  );
};

export default Events;
