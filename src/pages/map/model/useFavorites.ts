import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { favoriteKeys, fetchFavorites, addFavorite, type FavoriteItem } from '@/entities/favorite'

const NO_FAVORITES: FavoriteItem[] = []

/** 즐겨찾는 상권 — 목록 조회 + 등록(검색 오버레이의 등록 모드에서 사용) */
export function useFavorites() {
  const queryClient = useQueryClient()

  const query = useQuery({ queryKey: favoriteKeys.list(), queryFn: fetchFavorites })

  const addMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: favoriteKeys.list() }),
  })

  return { favorites: query.data ?? NO_FAVORITES, add: addMutation.mutate }
}
