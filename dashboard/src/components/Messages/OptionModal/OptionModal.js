import React from 'react'
import './OptionModal.css'
import Modal from '../../Reusable/Modal/Modal'
export default function OptionModal(props) {
  return (
    <div>
      <Modal {
        ...props
      } widthModalContent={}>

      </Modal>
    </div>
  )
}
