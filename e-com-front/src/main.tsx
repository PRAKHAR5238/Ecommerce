import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./styles/app.scss"
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store }  from './redux/store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>,
    {/* <App /> */}
  </StrictMode>,
)
0