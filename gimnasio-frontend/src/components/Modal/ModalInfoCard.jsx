import React from 'react';
import { Modal, ModalContent, ModalBody } from "@heroui/react";
import DecryptedText from '../TextAnimation/DecryptedText';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';

const ModalInfoCard = ({ isOpen, onClose, title, description }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
      scrollBehavior="inside"
      hideCloseButton={true}
      isDismissable={true}
      classNames={{
        base: "bg-white",
        header: "bg-transparent p-0",
        body: "py-6",
      }}
    >
      <ModalContent>
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-color-botones to-red-600 shadow-lg">
              <AssignmentLateIcon sx={{ fontSize: 28, color: 'white' }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {title}
            </h2>
          </div>
        </div>
        <ModalBody>
          <div className="py-4">
            <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200" style={{ minHeight: '200px' }}>
              <div className="flex items-center justify-center h-full w-full">
                {isOpen && (
                  <DecryptedText
                    key={`${isOpen}-${description}`}
                    text={description}
                    speed={30}
                    maxIterations={15}
                    sequential={true}
                    revealDirection="start"
                    animateOn="view"
                    className="text-base md:text-lg text-gray-800 text-center leading-relaxed font-medium"
                    encryptedClassName="text-gray-400"
                    parentClassName="w-full"
                  />
                )}
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalInfoCard;

