// Package set provides a generic set implementation
// backed by a Go map.
package set

// Set is an unordered collection of unique values.
// Elements must be comparable.
type Set[T comparable] map[T]struct{}

// NewSet creates an empty set.
//
// Example:
//
//	myNewSet := set.NewSet[string]()
func NewSet[T comparable]() Set[T] {
	return make(Set[T])
}

// Insert adds a value to the set.
// Example:
//
//	myNewSet.Insert("some string")
func (s Set[T]) Insert(value T) {
	s[value] = struct{}{}
}

// Erase removes a value from the set.
// It does nothing if the value is not present.
func (s Set[T]) Erase(value T) {
	delete(s, value)
}

// Contains reports whether the set contains a value.
// Example:
//
//	exists := myNewSet.Contains("some string")
func (s Set[T]) Contains(value T) bool {
	_, exists := s[value]
	return exists
}

// Len returns the number of elements in the set.
func (s Set[T]) Len() int {
	return len(s)
}
