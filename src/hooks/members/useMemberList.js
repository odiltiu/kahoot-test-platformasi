import { useEffect, useMemo, useState } from 'react'
import { mockGroupNameById, mockMemberList } from '../../mocks/membersMock'
import { MOCK_API_DELAY } from '../../constants/appConstants'

const SEARCH_DEBOUNCE_MS = 300
const DEFAULT_SORT_FIELD = 'name'
const INITIAL_LOAD_STATE = { memberList: [], isLoading: true, loadError: null }

const SORT_COMPARATORS = {
  name: (first, second) => first.name.localeCompare(second.name),
  score: (first, second) => second.avgScore - first.avgScore,
  attendance: (first, second) => second.attendanceRate - first.attendanceRate,
}

// Guruh o'quvchilarini (hozircha mock) yuklaydi
function useGroupMembersLoad(groupId) {
  const [loadState, setLoadState] = useState(INITIAL_LOAD_STATE)
  const [loadedGroupId, setLoadedGroupId] = useState(groupId)

  // Boshqa guruhga o'tilganda oldingi ro'yxat ko'rinib turmasligi uchun holat tozalanadi
  if (loadedGroupId !== groupId) {
    setLoadedGroupId(groupId)
    setLoadState(INITIAL_LOAD_STATE)
  }

  useEffect(() => {
    const timerId = setTimeout(
      () => setLoadState({ memberList: mockMemberList, isLoading: false, loadError: null }),
      MOCK_API_DELAY,
    )
    return () => clearTimeout(timerId)
  }, [groupId])

  return [loadState, setLoadState]
}

// Har harf bosilganda emas, yozish to'xtagach 300ms dan keyin qidiradi
function useDebouncedValue(value, delayMs) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(timerId)
  }, [value, delayMs])
  return debouncedValue
}

function useMemberList(groupId) {
  const [loadState, setLoadState] = useGroupMembersLoad(groupId)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState(DEFAULT_SORT_FIELD)
  const debouncedQuery = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS)
  const { memberList, isLoading, loadError } = loadState

  const filteredList = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase()
    const matchedList = memberList.filter((member) => member.name.toLowerCase().includes(normalizedQuery))
    return [...matchedList].sort(SORT_COMPARATORS[sortField])
  }, [memberList, debouncedQuery, sortField])

  function removeMember(memberId) {
    setLoadState((current) => ({ ...current, memberList: current.memberList.filter((member) => member.id !== memberId) }))
  }

  return {
    groupName: mockGroupNameById[groupId] ?? 'Guruh',
    memberList, filteredList, searchQuery, setSearchQuery,
    sortField, sortBy: setSortField, removeMember, isLoading, loadError,
  }
}

export default useMemberList
