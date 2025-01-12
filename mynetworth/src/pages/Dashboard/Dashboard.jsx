import { Tabs, Tab } from "@mui/material";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
      {/* <Tab label="Home" />
      <Tab label="Profile" />
      <Tab label="Settings" /> */}
    </Tabs>
  );
};

export default Dashboard;
