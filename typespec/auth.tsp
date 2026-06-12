import "@typespec/http";
import "@typespec/json-schema";

using TypeSpec.Http;
using TypeSpec.JsonSchema;
using Unveiled.Api.Common;

@jsonSchema
namespace Unveiled.Api.Auth;

@doc("Account identity record exposed over the wire.")
model User {
  @doc("Stable user identifier.")
  id: Id;

  @doc("Primary email address.")
  email: Email;

  @doc("Display name derived from the user profile.")
  name: string;

  @doc("Account role.")
  role: Role;

  @doc("True when the account is frozen by an admin override.")
  frozen: boolean;
}

@doc("Localized user-facing profile fields.")
model Profile {
  @doc("Profile id (matches user id).")
  userId: Id;

  @doc("First name, may be empty.")
  firstName?: string;

  @doc("Last name, may be empty.")
  lastName?: string;

  @doc("Preferred UI language.")
  language: Language;

  @doc("Optional display avatar URL.")
  avatarUrl?: string;

  @doc("Whether the user opted into the newsletter.")
  newsletterOptIn: boolean;

  @doc("Available booking credits, may be negative when frozen.")
  credits: int32;
}

@doc("Active session summary.")
model Session {
  @doc("Session id.")
  id: Id;

  @doc("Session owner user id.")
  userId: Id;

  @doc("Session creation timestamp.")
  createdAt: Timestamp;

  @doc("Session expiry timestamp.")
  expiresAt: Timestamp;
}

@doc("Auth state used in API responses.")
model AuthState {
  @doc("True when authentication succeeded.")
  ok: boolean;

  @doc("State discriminator.")
  status: "idle" | "loading" | "success" | "error" | "unauthenticated" | "forbidden";

  @doc("Top-level error message.")
  message?: string;

  @doc("Optional field-level error map.")
  fieldErrors?: Record<string>;

  @doc("Redirect target after success.")
  nextPath?: string;
}

@doc("Login request body.")
model LoginRequest {
  @doc("User email.")
  email: Email;

  @doc("User password (min 8 characters).")
  password: string;

  @doc("Optional URL to redirect to after success.")
  callbackURL?: string;
}

@doc("Signup request body.")
model SignupRequest {
  @doc("User email.")
  email: Email;

  @doc("User password (min 8 characters).")
  password: string;

  @doc("User first name.")
  firstName: string;

  @doc("User last name.")
  lastName: string;

  @doc("Optional URL to redirect to after success.")
  callbackURL?: string;
}

@doc("Password recovery request body.")
model PasswordRecoveryRequest {
  @doc("Email address to send the recovery link to.")
  email: Email;

  @doc("Optional URL the recovery link redirects to.")
  redirectTo?: string;
}

@doc("Logout request body (empty).")
model LogoutRequest {
  @doc("Empty marker for the logout endpoint.")
  _placeholder?: string;
}

@doc("Generic auth result with optional user/session and next path.")
model AuthResult {
  @doc("Auth state envelope.")
  state: AuthState;

  @doc("Authenticated user, when login/signup succeeded.")
  user?: User;

  @doc("Newly created session, when login/signup succeeded.")
  session?: Session;

  @doc("Path to navigate to after success.")
  nextPath?: string;
}

@doc("Account me response (placeholder for 09-iteration).")
model AccountMe {
  @doc("The authenticated user.")
  user: User;

  @doc("The user's profile.")
  profile: Profile;
}

@doc("Profile update request (placeholder for 09-iteration).")
model UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  language: Language;
  newsletterOptIn: boolean;
  billingAddress?: BillingAddress;
}

@doc("Billing address fields stored on the profile.")
model BillingAddress {
  name?: string;
  country?: CountryCode;
  postalCode?: string;
  city?: string;
  line1?: string;
  line2?: string;
}

@route("/account")
namespace AccountRoutes {
  @route("/signup")
  @post
  op signup(@body request: SignupRequest): AuthResult;

  @route("/login")
  @post
  op login(@body request: LoginRequest): AuthResult;

  @route("/logout")
  @post
  op logout(@body request: LogoutRequest): AuthResult;

  @route("/password-recovery")
  @post
  op passwordRecovery(@body request: PasswordRecoveryRequest): AuthResult;
}

@route("/me")
namespace MeRoutes {
  @get
  op getMe(): AccountMe;

  @patch
  @route("/profile")
  op updateProfile(@body request: UpdateProfileRequest): AccountMe;

  @delete
  op deleteAccount(): AuthResult;
}
