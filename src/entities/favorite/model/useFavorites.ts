import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { favoriteKeys, fetchFavorites, addFavorite, removeFavorite } from '../api/favoriteApi'
import type { FavoriteItem } from './types'

const NO_FAVORITES: FavoriteItem[] = []

/** 즐겨찾는 상권 — 목록 조회 + 등록(지도 검색 등록 모드) + 해제(즐겨찾는 지역 편집) */
export function useFavorites() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: favoriteKeys.list() })

  const query = useQuery({ queryKey: favoriteKeys.list(), queryFn: fetchFavorites })
  const addMutation = useMutation({ mutationFn: addFavorite, onSuccess: invalidate })
  const removeMutation = useMutation({ mutationFn: removeFavorite, onSuccess: invalidate })

  return {
    favorites: query.data ?? NO_FAVORITES,
    add: addMutation.mutate,
    remove: removeMutation.mutate,
  }
}
