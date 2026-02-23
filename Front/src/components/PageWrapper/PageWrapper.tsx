import "./PageWrapper.css";

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
}) => {
  return (
    <div className="page-wrapper">
      <div className="page-container">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;