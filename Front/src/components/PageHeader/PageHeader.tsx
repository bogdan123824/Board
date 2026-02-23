import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Navbar, Nav, Button, Form, InputGroup } from "react-bootstrap";

import Logo from "../../assets/icons/Logo.svg?react";
import UserIcon from "../../assets/icons/UserIcon.svg?react";
import Search from "../../assets/icons/Search.svg?react";

const PageHeader: FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState<string>("");

  return (
    <Navbar
      style={{
        width: "100%"
      }}
    >
      <Nav
        className="me-auto"
        style={{
          display: "flex",
          alignItems: "center"
        }}
      >
        <Logo
          width={120}
          height={80}
          onClick={() => navigate('/')}
          style={{
            cursor: "pointer"
          }}
        />
      </Nav>
      <Nav
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "14px"
        }}
      >
        <InputGroup style={{
          marginLeft: "16px"
        }}>
          <Form.Control
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            onClick={() => {
              navigate("/", { state: { title: search } });
            }}
            style={{
              height: "45.33px"
            }}
          >
            <Search width={22} height={22} />
          </Button>
        </InputGroup>
        <Button
          onClick={() => navigate('/profile')}
          style={{
            height: "45.33px"
          }}
        >
          <UserIcon width={22} height={22} />
        </Button>
      </Nav>
    </Navbar>
  );
};

export default PageHeader;
