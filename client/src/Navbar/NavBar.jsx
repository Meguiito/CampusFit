import React from 'react';
import styled from 'styled-components';

function Navbar() {
  return (
    <Home>
      <header>
        <Portada>
          <Logo src="/imgUCT/UCTLogo.png" alt="UCT Logo" />
          <Title>CampusFit</Title>
        </Portada>
        <NavBar>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/Perfil">Perfil</a></li>
            <li><a href="/ReservaEspecial">Reserva Especial</a></li>
          </ul>
        </NavBar>
      </header>
    </Home>
  );
}

export default Navbar;

const Home = styled.div`
  font-family: Arial, sans-serif;
`;

const Portada = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3px;
  background-color: #3498DB;
  padding: 10px;
`;

const Logo = styled.img`
  width: 250px;
  height: auto;
`;

const Title = styled.h1`
  font-size: 2em;
  color: white;
`;

const NavBar = styled.nav`
  background-color: #3498DB;
  padding: 15px;

  ul {
    display: flex;
    justify-content: flex-start;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-right: 40px;
  }

  a {
    text-decoration: none;
    color: white;
    font-size: 1.2em;
  }

  a:hover {
    color: #F1C40F;
  }
`;
