export const REVIEW_ORDER = {
    CREATED_AT: 'created_at',
    DESC: 'DESC'
} as const;

export const REVIEW_SELECT_FIELDS = {
    ID: 'reviews.id as id',
    CONTENT: 'reviews.review_content as content',
    CREATED_AT: 'reviews.created_at as "createdAt"',
    PROFILE_ID: 'profiles.id as "profileId"',
    PROFILE_NAME: 'profiles.name as "profileName"'
} as const; 