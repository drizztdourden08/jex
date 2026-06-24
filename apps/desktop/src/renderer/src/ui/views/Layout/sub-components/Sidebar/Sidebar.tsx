import { NavLink } from 'react-router-dom'
import { Box } from '@ds/primitives/layout/Box'
import { links } from './Sidebar.constants'
import './Sidebar.css'

const Sidebar = () => {
  return (
    <Box as="aside" className="sidebar">
      <Box as="nav" className="nav">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
            {l.label}
          </NavLink>
        ))}
      </Box>
    </Box>
  )
}

export { Sidebar }
