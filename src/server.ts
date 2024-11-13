import fastify from "fastify";

import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";

import fastifyCors from "@fastify/cors";

import fastifyJwt from "@fastify/jwt";

import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";

import { errorHandler } from "./error-handler";

import { env } from "./env";

import { authenticateWithPassword } from "./http/routes/auth/authenticate-with-password";
import { createAccount } from "./http/routes/auth/create-account";
import { getProfile } from "./http/routes/auth/get-profile";
import { requestPasswordRecover } from "./http/routes/auth/request-password.recovery";
import { resetPassword } from "./http/routes/auth/reset-password";

import { getMembers } from "./http/routes/members/get-members";
import { removeMember } from "./http/routes/members/remove-members";
import { updateMember } from "./http/routes/members/update-member";
import { changeMemberArea } from "./http/routes/members/change-member-area";

import { getAnamnesisAmount } from "./http/routes/metrics/get-anamnesis-amount";
import { getAthletesAmount } from "./http/routes/metrics/get-athletes-amount";
import { getAthletesByGenderAmount } from "./http/routes/metrics/get-athletes-by-gender-amount";
import { getGuardiansAmount } from "./http/routes/metrics/get-guardian-amount";
import { getAthletesLastWeekAmount } from "./http/routes/metrics/get-last-week-athletes-amount";
import { getAverageAgeAmount } from "./http/routes/metrics/get-average-age-amount";

import { createAthlete } from "./http/routes/athletes/create-athlete";
import { getAthletes } from "./http/routes/athletes/get-athletes";
import { getAthlete } from "./http/routes/athletes/get-athlete";
import { removeAthlete } from "./http/routes/athletes/remove-athlete";
import { updateAthlete } from "./http/routes/athletes/update-athlete";

import { updateAthleteAddress } from "./http/routes/athletes/update-address";
import { updateAthleteGuardian } from "./http/routes/athletes/update-guardian";

import { changeEmail } from "./http/routes/account/change-email";
import { changePassword } from "./http/routes/account/change-password";
import { updateAccount } from "./http/routes/account/update-account";

import { getAthleteObservation } from "./http/routes/athletes/get-athlete-observation";
import { createAthleteObservation } from "./http/routes/athletes/create-athlete-observation";
import { updateAthleteObservation } from "./http/routes/athletes/update-athlete-observation";
import { removeAthleteObservation } from "./http/routes/athletes/remove-athlete-observation";

import { generateAIObservation } from "./http/routes/llama/generate-ai-observation";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler(errorHandler);

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: "",
            description: "",
            version: ""
        },

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },

        servers: []
    },

    transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
    routePrefix: "/docs"
})

app.register(fastifyJwt, { secret: env.JWT_SECRET });

app.register(fastifyCors);

app.register(authenticateWithPassword);
app.register(createAccount);
app.register(getProfile);
app.register(requestPasswordRecover);
app.register(resetPassword);

app.register(changeMemberArea);
app.register(getMembers);
app.register(updateMember);
app.register(removeMember);

app.register(changeEmail);
app.register(changePassword);
app.register(updateAccount);

app.register(getAnamnesisAmount);
app.register(getAthletesAmount);
app.register(getAthletesByGenderAmount);
app.register(getAverageAgeAmount);
app.register(getGuardiansAmount);
app.register(getAthletesLastWeekAmount);

app.register(getAthlete);
app.register(getAthletes);
app.register(createAthlete);
app.register(updateAthlete);
app.register(removeAthlete);

app.register(updateAthleteAddress);
app.register(updateAthleteGuardian);

app.register(getAthleteObservation);
app.register(createAthleteObservation);
app.register(updateAthleteObservation);
app.register(removeAthleteObservation);

app.register(generateAIObservation);

app.listen({
    host: "0.0.0.0",
    port: env.PORT
}).then(() => console.log(`🔥 HTTP server running at http://localhost:${env.PORT}`))