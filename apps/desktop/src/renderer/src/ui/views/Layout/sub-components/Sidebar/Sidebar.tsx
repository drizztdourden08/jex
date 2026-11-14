import { NavLink } from 'react-router-dom'
import { Box } from '@ds/primitives/layout/Box'
import { Glyph } from '@ds/primitives/media/Glyph'
import { IconButton } from '@ds/primitives/actions/IconButton'
import { useSidebar } from '@/store/sidebar'
import { links } from './Sidebar.constants'
import './Sidebar.css'

const Sidebar = () => {
  const { collapsed, toggle } = useSidebar()
  return (
    <Box as="aside" className={collapsed ? 'sidebar sidebar--collapsed' : 'sidebar'}>
      <IconButton
        plain
        label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        aria-expanded={!collapsed}
        className="sidebar__toggle"
        onClick={toggle}
      >
        <Glyph name={collapsed ? 'chevron-right' : 'chevron-left'} size={14} />
      </IconButton>
      <Box as="nav" className="nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            title={l.label}
            aria-label={l.label}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <Glyph name={l.icon} size={18} />
            <Box as="span" className="nav__label">
              {l.label}
            </Box>
          </NavLink>
        ))}
      </Box>
    </Box>
  )
}

export { Sidebar }
