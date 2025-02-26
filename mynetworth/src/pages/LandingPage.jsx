import IntroContainer from "../components/IntroContainer";
import DetailContainer from "../components/DetailContainer";
import DemoContainer from "../components/DemoContainer";
import FooterContainer from "../components/FooterContainer";

export default function LandingPage() {
  return (
    <div id="landing-container" className="flex flex-col">
      <IntroContainer />
      <DetailContainer />
      <DemoContainer />
      <FooterContainer />
    </div>
  );
}
