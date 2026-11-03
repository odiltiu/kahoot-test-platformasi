import { useEffect, useState } from 'react'
import { mockMemberList, mockStudentTestHistory } from '../../mocks/membersMock'
import { MOCK_API_DELAY } from '../../constants/appConstants'

const RECENT_TEST_LIMIT = 5
const NOT_FOUND_MESSAGE = "O'quvchi topilmadi."
const INITIAL_STATE = { studentProfile: null, recentTestList: [], isLoading: true, loadError: null }

function loadStudentProfile(studentId) {
  const foundStudent = mockMemberList.find((member) => member.id === studentId)
  if (!foundStudent) return { ...INITIAL_STATE, isLoading: false, loadError: NOT_FOUND_MESSAGE }
  const sortedHistory = [...mockStudentTestHistory].sort((first, second) => second.date.localeCompare(first.date))
  return { studentProfile: foundStudent, recentTestList: sortedHistory.slice(0, RECENT_TEST_LIMIT), isLoading: false, loadError: null }
}

function useStudentProfile(studentId) {
  const [profileState, setProfileState] = useState(INITIAL_STATE)
  const [loadedStudentId, setLoadedStudentId] = useState(studentId)

  // Boshqa o'quvchiga o'tilganda eski profil va xato qolib ketmasligi uchun holat tozalanadi
  if (loadedStudentId !== studentId) {
    setLoadedStudentId(studentId)
    setProfileState(INITIAL_STATE)
  }

  useEffect(() => {
    const timerId = setTimeout(() => setProfileState(loadStudentProfile(studentId)), MOCK_API_DELAY)
    return () => clearTimeout(timerId)
  }, [studentId])

  return profileState
}

export default useStudentProfile
