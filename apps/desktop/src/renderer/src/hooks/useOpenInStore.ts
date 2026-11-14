import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStoreNav } from '@/store/storeNav'

/**
 * Open a Steam web page (store page, discussions) in the embedded Store tab, which is
 * logged in. Only truly external links go to the OS browser.
 */
const useOpenInStore = () => {
  const navigate = useNavigate()
  return useCallback(
    (url: string) => {
      navigate('/store')
      useStoreNav.getState().controls?.loadURL(url)
    },
    [navigate],
  )
}

export { useOpenInStore }
