export type Result<T, E = Error> = Success<T> | Failure<E>;

interface Success<T> {
  success: true;
  data: T;
}

interface Failure<E> {
  success: false;
  error: E;
}

export const success = <T>(data: T): Success<T> => ({ success: true, data });
export const failure = <E>(error: E): Failure<E> => ({ success: false, error });
