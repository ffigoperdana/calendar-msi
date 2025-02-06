import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { gapi } from "gapi-script";
import '../css/Events.css';

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
      name: "BCA-2024-DC MBCA",
      link: "https://www.wrike.com/open.htm?id=1278006298",
      code: "[TB002724D0049]",
    },
    DRC: {
      name: "BCA-2024-DRC Grha Asia Sby",
      link: "https://www.wrike.com/open.htm?id=1184331369",
      code: "[TB002724D0059]",
    },
    KP: {
      name: "BCA-2024-KP Extention",
      link: "https://www.wrike.com/open.htm?id=1184331441",
      code: "[TB002724D0039]",
    },
    BRANCH: {
      name: "Maintenance Cabang BCA 2024",
      link: "https://www.wrike.com/open.htm?id=1030475273",
      code: "[TB002724D0019]",
    },
    PEMREK: {
      name: "Maintenance Perangkat REM 2024",
      link: "https://www.wrike.com/open.htm?id=1060642290",
      code: "[TB002724D0029]",
    },
    IPTEL: {
      name: "Maintenance IPTEL BCA 2024",
      link: "https://www.wrike.com/open.htm?id=1257841515",
      code: "[TB002724D0099]",
    },
    CISCO: {
      name: "Renewal Maintenance Cisco 2024",
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

  return (
    <div className="container mt-5 mb-5">
      <h2 className="my-4">Create Event</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group mt-2">
          <label className="mb-2">Working Type</label>
          <select className="form-control" value={workingType} onChange={(e) => setWorkingType(e.target.value)} required>
            <option value="">Select Working Type</option>
            <option value="Implement">Implement</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
        <div className="form-group mt-2">
          <label className="mb-2">Division</label>
          <select className="form-control" value={division} onChange={(e) => setDivision(e.target.value)} required>
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
        <div className="form-group mt-2">
          <label className="mb-2">What To Do</label>
          <input type="text" className="form-control" value={whatToDo} onChange={(e) => setWhatToDo(e.target.value)} required />
        </div>
        <div className="form-group mt-2">
          <label className="mb-2">User</label>
          <select className="form-control" value={userType} onChange={(e) => setUserType(e.target.value)} required>
            <option value="">Select User</option>
            <option value="BCA">BCA</option>
            <option value="BCAF">BCAF</option>
            <option value="BCAD">BCAD</option>
          </select>
        </div>
        <div className="form-group mt-2">
          <label className="mb-2">Case Situation</label>
          <select className="form-control" value={caseSituation} onChange={(e) => setCaseSituation(e.target.value)} required>
            <option value="">Select Case Situation</option>
            <option value="On Progress">On Progress</option>
            <option value="Temporary Solution">Temporary Solution</option>
            <option value="Solved">Solved</option>
          </select>
        </div>
        <div className="form-group mt-2">
          <label className="mb-2">Case ID</label>
          <input type="text" className="form-control" value={caseId} onChange={(e) => setCaseId(e.target.value)} required />
        </div>
        <div className="form-group mt-2">
          <label className="mb-2">Situation Role</label>
          <select className="form-control" value={situationRole} onChange={(e) => setSituationRole(e.target.value)} required>
            <option value="">Select Situation Role</option>
            <option value="Problem">Problem</option>
            <option value="Support">Support</option>
            <option value="Change">Change</option>
          </select>
        </div>
        <div className="form-group mt-2">
          <label className="mb-2">Risk Problem</label>
          <select className="form-control" value={riskProblem} onChange={(e) => setRiskProblem(e.target.value)} required>
            <option value="">Select Risk Problem</option>
            <option value="Major">Major</option>
            <option value="Minor">Minor</option>
          </select>
        </div>
        <div className="form-group mt-2">
          <label className="mb-2">Devices</label>
          <input type="text" className="form-control" value={devices} onChange={(e) => setDevices(e.target.value)} required />
        </div>
        <div className="form-group mt-2">
          <label className="mb-2">Location</label>
          <input type="text" className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>
        <div className="form-group mt-2">
          <label className="mb-2">Description</label>
          <input type="text" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="form-group mt-2">
          <label className="mb-2">Problem Analysis</label>
          <input type="text" className="form-control" value={problemAnalysis} onChange={(e) => setProblemAnalysis(e.target.value)} required />
        </div>
        <div className="form-group mt-2">
          <label className="mb-2">Request</label>
          <input type="text" className="form-control" value={request} onChange={(e) => setRequest(e.target.value)} required />
        </div>
        <div className="form-group mt-2">
          <label className="mb-2">User Request</label>
          <input type="text" className="form-control" value={userRequest} onChange={(e) => setUserRequest(e.target.value)} required />
        </div>
        <div className="form-group mt-2">
          <label className="mb-2">Date</label>
          <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="form-group mt-2">
          <label className="mb-2">Start Time</label>
          <input type="time" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div className="form-group mt-2">
          <label className="mb-2">End Time</label>
          <input type="time" className="form-control" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>
        <div className="d-grid gap-2 mt-3">
          <button type="button" className="btn btn-primary" onClick={handleCheck}>Check</button>
        </div>
        <div className="form-group mt-3">
          <label className="mb-2">Generated Title</label>
          <textarea className="form-control" value={editableTitle} onChange={(e) => setEditableTitle(e.target.value)} />
        </div>
        <div className="form-group mt-4">
          <label className="mb-2">Generated Detail</label>
          <textarea className="form-control" value={editableDetail} onChange={(e) => setEditableDetail(e.target.value)} />
        </div>
        <div className="d-grid gap-2 mt-3">
          <button type="submit" className="btn btn-success ml-2" disabled={!isChecked}>Submit</button>
        </div>
      </form>
    </div>
  );
};

export default Events;
